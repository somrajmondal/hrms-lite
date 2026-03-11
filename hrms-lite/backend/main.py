from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import uvicorn

from database import get_db, engine
import models
import schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "HRMS Lite API is running"}


# ─── Employee Endpoints ───────────────────────────────────────────────────────

@app.post("/employees", response_model=schemas.Employee, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    # Check duplicate employee_id
    existing = db.query(models.Employee).filter(
        models.Employee.employee_id == employee.employee_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Employee ID '{employee.employee_id}' already exists")

    # Check duplicate email
    existing_email = db.query(models.Employee).filter(
        models.Employee.email == employee.email
    ).first()
    if existing_email:
        raise HTTPException(status_code=409, detail=f"Email '{employee.email}' is already registered")

    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


@app.get("/employees", response_model=List[schemas.EmployeeWithStats])
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).all()
    result = []
    for emp in employees:
        total = db.query(models.Attendance).filter(
            models.Attendance.employee_id == emp.id
        ).count()
        present = db.query(models.Attendance).filter(
            models.Attendance.employee_id == emp.id,
            models.Attendance.status == "Present"
        ).count()
        result.append(schemas.EmployeeWithStats(
            **{c.name: getattr(emp, c.name) for c in emp.__table__.columns},
            total_days=total,
            present_days=present
        ))
    return result


@app.get("/employees/{employee_id}", response_model=schemas.EmployeeWithStats)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    total = db.query(models.Attendance).filter(
        models.Attendance.employee_id == emp.id
    ).count()
    present = db.query(models.Attendance).filter(
        models.Attendance.employee_id == emp.id,
        models.Attendance.status == "Present"
    ).count()
    return schemas.EmployeeWithStats(
        **{c.name: getattr(emp, c.name) for c in emp.__table__.columns},
        total_days=total,
        present_days=present
    )


@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    # Delete related attendance records
    db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id).delete()
    db.delete(emp)
    db.commit()
    return None


# ─── Attendance Endpoints ─────────────────────────────────────────────────────

@app.post("/attendance", response_model=schemas.Attendance, status_code=201)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    # Verify employee exists
    emp = db.query(models.Employee).filter(
        models.Employee.id == attendance.employee_id
    ).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Check duplicate date entry
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()
    if existing:
        # Update existing record
        existing.status = attendance.status
        db.commit()
        db.refresh(existing)
        return existing

    db_attendance = models.Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


@app.get("/attendance", response_model=List[schemas.AttendanceWithEmployee])
def get_all_attendance(
    date_filter: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Attendance)
    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)
    records = query.order_by(models.Attendance.date.desc()).all()
    result = []
    for rec in records:
        emp = db.query(models.Employee).filter(models.Employee.id == rec.employee_id).first()
        result.append(schemas.AttendanceWithEmployee(
            id=rec.id,
            employee_id=rec.employee_id,
            date=rec.date,
            status=rec.status,
            employee_name=emp.full_name if emp else "Unknown",
            employee_code=emp.employee_id if emp else "N/A",
            department=emp.department if emp else "N/A"
        ))
    return result


@app.get("/attendance/employee/{employee_id}", response_model=List[schemas.Attendance])
def get_employee_attendance(
    employee_id: int,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db)
):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    query = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id
    )
    if date_from:
        query = query.filter(models.Attendance.date >= date_from)
    if date_to:
        query = query.filter(models.Attendance.date <= date_to)

    return query.order_by(models.Attendance.date.desc()).all()


# ─── Dashboard ────────────────────────────────────────────────────────────────

@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    total_employees = db.query(models.Employee).count()
    today = date.today()
    today_present = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "Present"
    ).count()
    today_absent = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "Absent"
    ).count()
    today_marked = today_present + today_absent

    departments = db.query(models.Employee.department).distinct().all()
    dept_counts = {}
    for (dept,) in departments:
        count = db.query(models.Employee).filter(
            models.Employee.department == dept
        ).count()
        dept_counts[dept] = count

    return {
        "total_employees": total_employees,
        "today_present": today_present,
        "today_absent": today_absent,
        "today_marked": today_marked,
        "today_unmarked": total_employees - today_marked,
        "departments": dept_counts
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

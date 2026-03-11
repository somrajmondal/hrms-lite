from pydantic import BaseModel, EmailStr, field_validator
from datetime import date

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def not_empty(cls, v):
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

class Employee(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    model_config = {"from_attributes": True}

class EmployeeWithStats(Employee):
    total_days: int = 0
    present_days: int = 0

class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: str

    @field_validator("status")
    @classmethod
    def status_must_be_valid(cls, v):
        if v not in ("Present", "Absent"):
            raise ValueError("Status must be 'Present' or 'Absent'")
        return v

class Attendance(BaseModel):
    id: int
    employee_id: int
    date: date
    status: str
    model_config = {"from_attributes": True}

class AttendanceWithEmployee(Attendance):
    employee_name: str
    employee_code: str
    department: str
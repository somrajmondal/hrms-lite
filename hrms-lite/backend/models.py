from sqlalchemy import Column, Integer, String, Date, Enum
from database import Base
import enum


class AttendanceStatus(str, enum.Enum):
    present = "Present"
    absent = "Absent"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False)

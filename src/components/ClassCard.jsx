// @ts-ignore;
import React from 'react';

export function ClassCard({
  classItem,
  onClick
}) {
  const remainingSeats = classItem.maxStudents - classItem.students;
  return <div className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick(classItem._id)}>
      <img src={classItem.image} alt={classItem.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800">{classItem.name}</h3>
          <span className="text-orange-500 font-bold">¥{classItem.price}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{classItem.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span><i className="fas fa-clock mr-1"></i>{classItem.duration}</span>
          <span><i className="fas fa-user mr-1"></i>{classItem.teacher}</span>
          <span className={remainingSeats <= 0 ? 'text-red-500' : ''}>
            {classItem.students}/{classItem.maxStudents}人
          </span>
        </div>
      </div>
    </div>;
}
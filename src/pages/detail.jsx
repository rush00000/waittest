// @ts-ignore;
import React, { useState, useEffect } from 'react';

import { BottomNav } from '@/components/BottomNav';
export default function DetailPage(props) {
  const [classData, setClassData] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const classId = props.$w.page.dataset.params?.id;

  // 从数据模型获取课程详情
  const loadClassDetail = async () => {
    try {
      setLoading(true);
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'course_class',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: classId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (result) {
        setClassData(result);
        setIsFull(result.students >= result.maxStudents);

        // 检查是否已报名该课程
        checkEnrollmentStatus(classId);
      }
    } catch (error) {
      console.error('获取课程详情失败:', error);
      alert('获取课程详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 检查用户是否已报名该课程
  const checkEnrollmentStatus = async classId => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'registration_record',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              classId: {
                $eq: classId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });

      // 这里简化处理，实际应该根据当前用户ID过滤
      setIsEnrolled(result.records && result.records.length > 0);
    } catch (error) {
      console.error('检查报名状态失败:', error);
    }
  };
  useEffect(() => {
    if (classId) {
      loadClassDetail();
    }
  }, [classId]);
  const handleEnroll = () => {
    props.$w.utils.navigateTo({
      pageId: 'form',
      params: {
        classId
      }
    });
  };
  const handleBack = () => {
    props.$w.utils.navigateBack();
  };
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
    </div>;
  }
  if (!classData) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">课程信息不存在</p>
      </div>
    </div>;
  }
  const remainingSeats = classData.maxStudents - classData.students;
  return <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button onClick={handleBack} className="mr-4">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-semibold">班级详情</h1>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-md mx-auto pb-20">
        {/* 班级图片 */}
        <div className="relative">
          <img src={classData.image} alt={classData.name} className="w-full h-64 object-cover" />
          <div className="absolute top-4 left-4">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">热门</span>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-white p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{classData.name}</h1>
          <p className="text-gray-600 mb-4">{classData.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-3xl font-bold text-orange-500">¥{classData.price}</span>
              <span className="text-gray-500 text-sm ml-2">/期</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">剩余名额</div>
              <div className="text-lg font-semibold">{remainingSeats}人</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-b">
            <div>
              <div className="text-cyan-500 font-bold">{classData.duration}</div>
              <div className="text-sm text-gray-500">总课时</div>
            </div>
            <div>
              <div className="text-cyan-500 font-bold">{classData.teacher}</div>
              <div className="text-sm text-gray-500">授课老师</div>
            </div>
            <div>
              <div className="text-cyan-500 font-bold">{classData.level}</div>
              <div className="text-sm text-gray-500">适合年龄</div>
            </div>
          </div>
        </div>

        {/* 课程安排 */}
        <div className="bg-white mt-4 p-4">
          <h2 className="text-lg font-semibold mb-3">课程安排</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <i className="fas fa-calendar-alt text-cyan-500 w-5"></i>
              <span className="ml-3">{classData.schedule || '每周六、周日 14:00-16:00'}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-map-marker-alt text-cyan-500 w-5"></i>
              <span className="ml-3">{classData.location || 'A栋教学楼 3楼 301教室'}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-users text-cyan-500 w-5"></i>
              <span className="ml-3">小班教学，每班不超过{classData.maxStudents}人</span>
            </div>
          </div>
        </div>

        {/* 师资介绍 */}
        <div className="bg-white mt-4 p-4">
          <h2 className="text-lg font-semibold mb-3">师资介绍</h2>
          <div className="flex items-center">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" alt="老师头像" className="w-12 h-12 rounded-full" />
            <div className="ml-3">
              <div className="font-semibold">{classData.teacher}</div>
              <div className="text-sm text-gray-500">5年教学经验 | 资深讲师</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            毕业于北京师范大学，拥有丰富的教学经验，善于激发学生学习兴趣，深受学生喜爱。
          </p>
        </div>

        {/* 学员评价 */}
        <div className="bg-white mt-4 p-4">
          <h2 className="text-lg font-semibold mb-3">学员评价</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-cyan-500 pl-3">
              <div className="flex items-center mb-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                </div>
                <span className="ml-2 text-sm text-gray-500">张妈妈</span>
              </div>
              <p className="text-sm text-gray-600">孩子很喜欢这个课程，老师很有耐心！</p>
            </div>
            <div className="border-l-4 border-cyan-500 pl-3">
              <div className="flex items-center mb-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                </div>
                <span className="ml-2 text-sm text-gray-500">李爸爸</span>
              </div>
              <p className="text-sm text-gray-600">课程内容丰富，孩子进步很大。</p>
            </div>
          </div>
        </div>
      </main>

      {/* 底部报名按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <button onClick={handleEnroll} disabled={isEnrolled || isFull} className={`w-full py-3 rounded-lg font-semibold transition ${isEnrolled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : isFull ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-cyan-600'}`}>
            {isEnrolled ? '已报名' : isFull ? '名额已满' : '立即报名'}
          </button>
        </div>
      </div>
    </div>;
}
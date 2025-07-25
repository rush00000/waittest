// @ts-ignore;
import React, { useState, useEffect } from 'react';

import { BottomNav } from '@/components/BottomNav';
export default function IndexPage(props) {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // 从数据模型获取课程列表
  const loadClasses = async () => {
    try {
      setLoading(true);
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'course_class',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 50,
          pageNumber: 1
        }
      });
      if (result.records && Array.isArray(result.records)) {
        setClasses(result.records);
        setFilteredClasses(result.records);
      }
    } catch (error) {
      console.error('获取课程列表失败:', error);
      alert('获取课程列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadClasses();
  }, []);
  useEffect(() => {
    let filtered = classes;
    if (searchTerm) {
      filtered = filtered.filter(cls => cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) || cls.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cls => cls.category === selectedCategory);
    }
    setFilteredClasses(filtered);
  }, [searchTerm, selectedCategory, classes]);
  const handleClassClick = classId => {
    props.$w.utils.navigateTo({
      pageId: 'detail',
      params: {
        id: classId
      }
    });
  };
  const handleTabChange = tab => {
    if (tab === 'my') {
      props.$w.utils.navigateTo({
        pageId: 'my-registrations'
      });
    }
  };
  const categories = [{
    key: 'all',
    label: '全部'
  }, {
    key: 'art',
    label: '艺术'
  }, {
    key: 'science',
    label: '科学'
  }, {
    key: 'language',
    label: '语言'
  }, {
    key: 'sport',
    label: '体育'
  }];
  return <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">班级报名</h1>
          <button onClick={() => props.$w.utils.navigateTo({
          pageId: 'my-registrations'
        })} className="text-gray-600">
            <i className="fas fa-user-circle text-2xl"></i>
          </button>
        </div>
      </header>

      {/* 搜索栏 */}
      <div className="max-w-md mx-auto px-4 py-3 bg-white">
        <div className="relative">
          <input type="text" placeholder="搜索班级名称..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500" />
          <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="max-w-md mx-auto px-4 py-2 bg-white">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {categories.map(category => <button key={category.key} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${selectedCategory === category.key ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setSelectedCategory(category.key)}>
              {category.label}
            </button>)}
        </div>
      </div>

      {/* 班级列表 - 改为列表形式 */}
      <main className="max-w-md mx-auto px-4 py-4 pb-20">
        {loading ? <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div> : filteredClasses.length === 0 ? <div className="flex flex-col items-center justify-center min-h-96">
            <img src="https://images.unsplash.com/photo-1586769852044-692d6e3703f2?w=200&h=200&fit=crop" alt="空状态" className="w-32 h-32 opacity-50 mb-4" />
            <p className="text-gray-500 text-center">暂无相关课程</p>
          </div> : <div className="space-y-3">
            {filteredClasses.map(classItem => <div key={classItem._id} className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleClassClick(classItem._id)}>
                <div className="flex">
                  <img src={classItem.image} alt={classItem.name} className="w-24 h-24 object-cover" />
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-base text-gray-800 flex-1">{classItem.name}</h3>
                      <span className="text-orange-500 font-bold text-sm ml-2">¥{classItem.price}</span>
                    </div>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">{classItem.description}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span><i className="fas fa-clock mr-1"></i>{classItem.duration}</span>
                      <span><i className="fas fa-user mr-1"></i>{classItem.teacher}</span>
                      <span className={classItem.students >= classItem.maxStudents ? 'text-red-500' : ''}>
                        {classItem.students}/{classItem.maxStudents}人
                      </span>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>}
      </main>

      <BottomNav activeTab="home" onTabChange={handleTabChange} />
    </div>;
}
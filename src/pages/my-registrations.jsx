// @ts-ignore;
import React, { useState, useEffect } from 'react';

import { BottomNav } from '@/components/BottomNav';
export default function MyRegistrationsPage(props) {
  const [registrations, setRegistrations] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRegistrationId, setCancelRegistrationId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 从数据模型获取报名记录
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'registration_record',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      });
      if (result.records && Array.isArray(result.records)) {
        setRegistrations(result.records);
      }
    } catch (error) {
      console.error('获取报名记录失败:', error);
      alert('获取报名记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadRegistrations();
  }, []);
  const handlePayNow = async registrationId => {
    try {
      await props.$w.cloud.callDataSource({
        dataSourceName: 'registration_record',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已付款'
          },
          filter: {
            where: {
              _id: {
                $eq: registrationId
              }
            }
          }
        }
      });

      // 重新加载报名记录
      loadRegistrations();
      alert('支付成功！');
    } catch (error) {
      console.error('更新支付状态失败:', error);
      alert('支付失败，请稍后重试');
    }
  };
  const showCancelConfirmation = registrationId => {
    setCancelRegistrationId(registrationId);
    setShowCancelModal(true);
  };
  const confirmCancel = async () => {
    if (cancelRegistrationId) {
      try {
        // 获取报名记录以获取课程ID
        const regResult = await props.$w.cloud.callDataSource({
          dataSourceName: 'registration_record',
          methodName: 'wedaGetItemV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: cancelRegistrationId
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        if (regResult) {
          // 删除报名记录
          await props.$w.cloud.callDataSource({
            dataSourceName: 'registration_record',
            methodName: 'wedaDeleteV2',
            params: {
              filter: {
                where: {
                  _id: {
                    $eq: cancelRegistrationId
                  }
                }
              }
            }
          });

          // 减少课程报名人数
          const classResult = await props.$w.cloud.callDataSource({
            dataSourceName: 'course_class',
            methodName: 'wedaGetItemV2',
            params: {
              filter: {
                where: {
                  _id: {
                    $eq: regResult.classId
                  }
                }
              },
              select: {
                $master: true
              }
            }
          });
          if (classResult) {
            await props.$w.cloud.callDataSource({
              dataSourceName: 'course_class',
              methodName: 'wedaUpdateV2',
              params: {
                data: {
                  students: Math.max(0, (classResult.students || 0) - 1)
                },
                filter: {
                  where: {
                    _id: {
                      $eq: regResult.classId
                    }
                  }
                }
              }
            });
          }
        }

        // 重新加载报名记录
        loadRegistrations();
        setShowCancelModal(false);
        setCancelRegistrationId(null);
        alert('报名已取消');
      } catch (error) {
        console.error('取消报名失败:', error);
        alert('取消报名失败，请稍后重试');
      }
    }
  };
  const handleTabChange = tab => {
    if (tab === 'home') {
      props.$w.utils.navigateTo({
        pageId: 'index'
      });
    }
  };
  const statusColors = {
    '待付款': 'bg-orange-100 text-orange-800',
    '已付款': 'bg-green-100 text-green-800',
    '已取消': 'bg-gray-100 text-gray-800'
  };
  return <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">我的报名</h1>
          <button onClick={() => props.$w.utils.navigateTo({
          pageId: 'index'
        })} className="text-gray-600">
            <i className="fas fa-home text-2xl"></i>
          </button>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-md mx-auto px-4 py-4 pb-20">
        {loading ? <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div> : registrations.length === 0 ? <div className="flex flex-col items-center justify-center min-h-96">
            <img src="https://images.unsplash.com/photo-1586769852044-692d6e3703f2?w=200&h=200&fit=crop" alt="空状态" className="w-32 h-32 opacity-50 mb-4" />
            <p className="text-gray-500 text-center mb-4">暂无报名记录</p>
            <button onClick={() => props.$w.utils.navigateTo({
          pageId: 'index'
        })} className="px-6 py-2 bg-cyan-500 text-white rounded-lg">
              去报名
            </button>
          </div> : <div className="space-y-4">
            {registrations.map(reg => <div key={reg._id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{reg.className}</h3>
                    <p className="text-sm text-gray-500 mt-1">学生：{reg.studentName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[reg.status]}`}>
                    {reg.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>家长姓名</span>
                    <span>{reg.parentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>联系电话</span>
                    <span>{reg.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>报名时间</span>
                    <span>{new Date(reg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>课程费用</span>
                    <span className="font-semibold text-orange-500">¥{reg.price}</span>
                  </div>
                </div>

                {reg.status === '待付款' && <div className="flex space-x-2 mt-4 pt-3 border-t">
                    <button onClick={() => handlePayNow(reg._id)} className="flex-1 py-2 bg-cyan-500 text-white rounded-lg text-sm">
                      立即支付
                    </button>
                    <button onClick={() => showCancelConfirmation(reg._id)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">
                      取消报名
                    </button>
                  </div>}
              </div>)}
          </div>}
      </main>

      <BottomNav activeTab="my" onTabChange={handleTabChange} />

      {/* 取消报名确认弹窗 */}
      {showCancelModal && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">确认取消报名？</h3>
            <p className="text-gray-600 text-sm mb-4">取消后需要重新报名，确定要取消吗？</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">
                取消
              </button>
              <button onClick={confirmCancel} className="flex-1 py-2 bg-red-500 text-white rounded-lg">
                确认取消
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
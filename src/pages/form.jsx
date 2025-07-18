// @ts-ignore;
import React, { useState, useEffect } from 'react';

export default function FormPage(props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    studentName: '',
    gender: '',
    birthDate: '',
    school: '',
    grade: '',
    parentName: '',
    relationship: '',
    phone: '',
    wechat: '',
    notes: ''
  });
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const classId = props.$w.page.dataset.params?.classId;
  const totalSteps = 3;

  // 从数据模型获取课程详情
  const loadClassInfo = async () => {
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
        setClassInfo(result);
      }
    } catch (error) {
      console.error('获取课程信息失败:', error);
      alert('获取课程信息失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (classId) {
      loadClassInfo();
    }
  }, [classId]);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const validateStep = step => {
    switch (step) {
      case 1:
        if (!formData.studentName.trim()) {
          alert('请输入学生姓名');
          return false;
        }
        if (!formData.gender) {
          alert('请选择性别');
          return false;
        }
        if (!formData.birthDate) {
          alert('请选择出生日期');
          return false;
        }
        break;
      case 2:
        if (!formData.parentName.trim()) {
          alert('请输入家长姓名');
          return false;
        }
        if (!formData.relationship) {
          alert('请选择与学生关系');
          return false;
        }
        if (!formData.phone.trim()) {
          alert('请输入联系电话');
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
          alert('请输入正确的手机号码');
          return false;
        }
        break;
      case 3:
        if (!document.getElementById('agreeTerms')?.checked) {
          alert('请阅读并同意报名协议');
          return false;
        }
        break;
    }
    return true;
  };
  const changeStep = direction => {
    if (direction > 0 && !validateStep(currentStep)) {
      return;
    }
    const newStep = currentStep + direction;
    if (newStep >= 1 && newStep <= totalSteps) {
      setCurrentStep(newStep);
    }
  };
  const submitForm = async () => {
    if (!validateStep(3)) {
      return;
    }
    try {
      setSubmitting(true);

      // 创建报名记录
      const registrationData = {
        classId: classId,
        className: classInfo.name,
        price: classInfo.price,
        studentName: formData.studentName,
        gender: formData.gender,
        birthDate: formData.birthDate,
        school: formData.school,
        grade: formData.grade,
        parentName: formData.parentName,
        relationship: formData.relationship,
        phone: formData.phone,
        wechat: formData.wechat,
        notes: formData.notes,
        status: '待付款'
      };
      await props.$w.cloud.callDataSource({
        dataSourceName: 'registration_record',
        methodName: 'wedaCreateV2',
        params: {
          data: registrationData
        }
      });

      // 更新课程报名人数
      await props.$w.cloud.callDataSource({
        dataSourceName: 'course_class',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            students: (classInfo.students || 0) + 1
          },
          filter: {
            where: {
              _id: {
                $eq: classId
              }
            }
          }
        }
      });

      // 跳转到我的报名页面
      props.$w.utils.redirectTo({
        pageId: 'my-registrations'
      });
    } catch (error) {
      console.error('提交报名失败:', error);
      alert('提交报名失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };
  const handleBack = () => {
    props.$w.utils.navigateBack();
  };
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
    </div>;
  }
  if (!classInfo) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">课程信息不存在</p>
      </div>
    </div>;
  }
  const progress = currentStep / totalSteps * 100;
  return <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button onClick={handleBack} className="mr-4">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-semibold">填写报名信息</h1>
        </div>
      </header>

      {/* 进度条 */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div className="bg-cyan-500 h-2 rounded-full transition-all duration-300" style={{
          width: `${progress}%`
        }}></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>基本信息</span>
          <span>家长信息</span>
          <span>确认支付</span>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pb-32">
        <form>
          {/* 步骤1：学生信息 */}
          {currentStep === 1 && <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">学生信息</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">学生姓名 *</label>
                <input type="text" value={formData.studentName} onChange={e => handleInputChange('studentName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">性别 *</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="gender" value="男" checked={formData.gender === '男'} onChange={e => handleInputChange('gender', e.target.value)} className="mr-2" />
                    <span>男</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="gender" value="女" checked={formData.gender === '女'} onChange={e => handleInputChange('gender', e.target.value)} className="mr-2" />
                    <span>女</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">出生日期 *</label>
                <input type="date" value={formData.birthDate} onChange={e => handleInputChange('birthDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">就读学校</label>
                <input type="text" value={formData.school} onChange={e => handleInputChange('school', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">年级</label>
                <select value={formData.grade} onChange={e => handleInputChange('grade', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500">
                  <option value="">请选择年级</option>
                  {['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三'].map(grade => <option key={grade} value={grade}>{grade}</option>)}
                </select>
              </div>
            </div>}

          {/* 步骤2：家长信息 */}
          {currentStep === 2 && <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">家长信息</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">家长姓名 *</label>
                <input type="text" value={formData.parentName} onChange={e => handleInputChange('parentName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">与学生关系 *</label>
                <select value={formData.relationship} onChange={e => handleInputChange('relationship', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500">
                  <option value="">请选择关系</option>
                  {['父亲', '母亲', '爷爷', '奶奶', '外公', '外婆', '其他'].map(rel => <option key={rel} value={rel}>{rel}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">联系电话 *</label>
                <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500" placeholder="请输入11位手机号" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">微信号</label>
                <input type="text" value={formData.wechat} onChange={e => handleInputChange('wechat', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">备注信息</label>
                <textarea value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500" placeholder="如有特殊需求请在此说明"></textarea>
              </div>
            </div>}

          {/* 步骤3：确认支付 */}
          {currentStep === 3 && <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">确认订单</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">课程名称</span>
                  <span className="font-medium">{classInfo.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">学生姓名</span>
                  <span className="font-medium">{formData.studentName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">家长姓名</span>
                  <span className="font-medium">{formData.parentName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">联系电话</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">总计</span>
                    <span className="text-2xl font-bold text-orange-500">¥{classInfo.price}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input type="checkbox" id="agreeTerms" className="mr-2" />
                  <span className="text-sm">我已阅读并同意<a href="#" className="text-cyan-500">《报名协议》</a></span>
                </label>
              </div>
            </div>}
        </form>
      </main>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex space-x-3">
          {currentStep > 1 && <button onClick={() => changeStep(-1)} className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700">
              上一步
            </button>}
          <button onClick={currentStep === totalSteps ? submitForm : () => changeStep(1)} disabled={submitting} className="flex-1 py-3 bg-cyan-500 text-white rounded-lg font-semibold disabled:opacity-50">
            {submitting ? '提交中...' : currentStep === totalSteps ? '确认支付' : '下一步'}
          </button>
        </div>
      </div>
    </div>;
}
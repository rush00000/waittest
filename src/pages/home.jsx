// @ts-ignore;
import React from 'react';

export default function HomePage(props) {
  // 设置首页重定向到index页面
  React.useEffect(() => {
    props.$w.utils.redirectTo({
      pageId: 'index'
    });
  }, []);
  return null;
}
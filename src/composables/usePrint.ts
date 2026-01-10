export function usePrint(resumeName: string) {
  const printResume = () => {
    // 1. 备份当前页面标题
    const originalTitle = document.title;
    
    // 2. 修改标题为文件名 (例如: 张三_前端工程师_简历)
    // 这样用户保存 PDF 时，文件名会自动变成这个
    document.title = resumeName || '我的简历';
    
    // 3. 调用系统打印
    window.print();
    
    // 4. (可选) 稍微延时后恢复标题，或者通过 window.onafterprint 恢复
    // 但为了确保保存文件名生效，建议不用立即恢复，或者 1秒后恢复
    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);
  };

  return { printResume };
}


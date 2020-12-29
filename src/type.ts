export interface Project {
  repoId: string;
  mrId: string;
}

export interface Action {
  /**
   * 按钮的标题
   */ 
  title: string;
  /**
   * 点击按钮触发的事件
   */
  callback: (projects: Project) => Promise<boolean>;
};

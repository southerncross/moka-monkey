import { Action } from './type';
import { applyForAllRepos } from './scheduler';
import { action as approve } from './actions/approve';

const actions: Action[] = [
  approve,
];

function init() {
  const repoNames = [
    "mage-client",
    "mage-hr-mobile-client",
    "mage-hm-mobile-client",
    "apply-web",
    "apply-mobile",
  ];

  actions.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.innerText = item.title;
    btn.onclick = () => {
      btn.classList.add('disabled');
      btn.innerText = '操作中...';
      applyForAllRepos(repoNames, item).then(() => {
        btn.classList.remove('disabled');
        btn.innerText = item.title;
      });
    };
    document.querySelector('.page-title-controls').append(btn);
  })
}

init();

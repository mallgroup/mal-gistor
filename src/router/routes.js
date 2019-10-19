const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      {
        name: 'homepage',
        path: '',
        component: () => import('pages/Index.vue')
      },
      { name: 'all', path: '/all', component: () => import('pages/All.vue') },
      {
        name: 'gist',
        path: '/gist/:id?',
        component: () => import('pages/Gist.vue'),
        props: true
      }
    ]
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { name: 'auth', path: '', component: () => import('pages/Auth.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes

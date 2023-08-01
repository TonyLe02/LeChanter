import Error from '../../components/NotFoundError.vue';

export default [
  {
    path: '/:catchAll(.*)',
    name: 'error',
    component: Error,
    meta: {
      displaySidebar: false,
    },
  },
];
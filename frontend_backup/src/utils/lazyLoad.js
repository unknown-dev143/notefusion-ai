import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

// Loading component (can be customized)
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Higher Order Component for lazy loading
const lazyLoad = (importFunc, options = {}) => {
  const { fallback = <LoadingFallback /> } = options;
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

lazyLoad.propTypes = {
  importFunc: PropTypes.func.isRequired,
  options: PropTypes.shape({
    fallback: PropTypes.node,
  }),
};

export default lazyLoad;

import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import useRole from '../hooks/useRole';

const RoleRoute = ({ allowedRoles, children }) => {
     const roleData = useRole();
     const currentRole = roleData?.userrole;

     if (!currentRole) {
          return <div className="flex items-center justify-center w-full h-[600px]"><span className="loading loading-ring w-[100px]"></span></div>;
     }

     if (!allowedRoles.includes(currentRole)) {
          return <Navigate to="/dashboard" replace />;
     }

     return <PrivateRoute>{children}</PrivateRoute>;
};

RoleRoute.propTypes = {
     allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
     children: PropTypes.node.isRequired
};

export default RoleRoute;

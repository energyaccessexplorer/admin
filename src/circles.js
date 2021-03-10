export function circles_user() {
  const claims = jwt_decode(localStorage.getItem('token'));

  if (['master', 'role'].includes(claims.role)) ;
  else return claims['data']['circles'];
};

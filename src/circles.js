export function circles_user() {
  const claims = jwt_decode(localStorage.getItem('token'));

  if (['master', 'root'].includes(claims.role)) return null;
  else return claims['data']['circles'];
};

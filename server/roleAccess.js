export const ROLE_LEVEL = { viewer: 1, staff: 2, admin: 3 };

export function requireRole(minimumRole) {
  return (req, res, next) => {
    if (!req.user || ROLE_LEVEL[req.user.role] < ROLE_LEVEL[minimumRole]) {
      return res.status(403).json({ message: 'บัญชีนี้ไม่มีสิทธิ์ดำเนินการ' });
    }
    next();
  };
}

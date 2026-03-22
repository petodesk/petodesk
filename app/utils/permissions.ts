export const routePermissions: Record<
  string,
  { roles: string[]; plans: string[] }
> = {

  "/dashboard": {
    roles: ["admin", "owner", "employee"],
    plans: ["inventory", "hr", "both"]
  },

  "/dashboard/sell": {
    roles: ["admin", "owner", "employee"],
    plans: ["inventory", "both"]
  },
 "/dashboard/expenses": {
    roles: ["admin", "owner", "employee"],
    plans: ["inventory", "hr", "both"]
  },
  "/dashboard/inventory": {
    roles: ["admin", "owner", "employee"],
    plans: ["inventory", "both"]
  },

  "/dashboard/payroll": {
    roles: ["admin", "owner"],
    plans: ["hr", "both"]
  },
   "/dashboard/tasks": {
    roles: ["admin", "owner",'employee'],
    plans: ["hr", "both"]
  },
   "/dashboard/leave-management": {
    roles: ["admin", "owner"],
    plans: ["hr", "both"]
  },
  "/dashboard/employee": {
    roles: ["admin", "owner"],
    plans: ["hr", "both",'inventory']
  },
 "/dashboard/leave": {
    roles: ["admin", "owner", "employee"],
    plans: ["hr", "both"]
  },
   "/dashboard/companyfeed": {
    roles: ["admin", "owner", "employee"],
    plans: ["hr", "both"]
  },
     "/dashboard/issue-complaints": {
    roles: ["admin", "owner", "employee"],
    plans: ["hr", "both"]
  },
  "/dashboard/reports": {
    roles: ["admin", "owner"],
    plans: ["inventory", "hr", "both"]
  }

}
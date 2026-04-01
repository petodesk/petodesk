export const routePermissions: Record<
  string,
  { roles: string[]; plans: string[] }
> = {

  "/dashboard": {
    roles: ["admin", "owner", "employee"],
    plans: ["inventory", "hr", "business_plus"]
  },

  "/dashboard/sell": {
    roles: ["admin", "owner", "employee"],
    plans: ["inventory", "business_plus"]
  },
 "/dashboard/expenses": {
    roles: ["admin", "owner", "employee"],
    plans: ["inventory", "hr", "business_plus"]
  },
  "/dashboard/inventory": {
    roles: ["admin", "owner", "employee"],
    plans: ["inventory", "business_plus"]
  },

  "/dashboard/payroll": {
    roles: ["admin", "owner"],
    plans: ["hr", "business_plus"]
  },
   "/dashboard/tasks": {
    roles: ["admin", "owner",'employee'],
    plans: ["hr", "business_plus"]
  },
   "/dashboard/leave-management": {
    roles: ["admin", "owner"],
    plans: ["hr", "business_plus"]
  },
  "/dashboard/employee": {
    roles: ["admin", "owner"],
    plans: ["hr", "business_plus",'inventory']
  },
    "/dashboard/clock_in/out": {
    roles: ["admin", "owner","employee"],
    plans: ["hr", "business_plus",'inventory']
  },
 "/dashboard/leave": {
    roles: ["admin", "owner", "employee"],
    plans: ["hr", "business_plus"]
  },
   "/dashboard/companyfeed": {
    roles: ["admin", "owner", "employee"],
    plans: ["hr", "business_plus"]
  },
     "/dashboard/issue-complaints": {
    roles: ["admin", "owner", "employee"],
    plans: ["hr", "business_plus"]
  },
  "/dashboard/reports": {
    roles: ["admin", "owner"],
    plans: ["inventory", "hr", "business_plus"]
  },
 
  "/dashboard/billing": {
    roles: ["admin", "owner"],
    plans: ["hr", "business_plus",'inventory']
  }
}
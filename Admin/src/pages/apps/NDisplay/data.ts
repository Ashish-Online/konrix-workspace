// Admin/src/pages/apps/Kanban/data.ts

export interface TaskTypes {
  id: string;             // MongoDB _id of the task
  title: string;
  status: string;
  categoryId: string;     // the ObjectId of its category
  categoryName: string;   // the human‐readable category name
  variant: string;
  dueDate: string;
  comments: number;
  attachments: number;
  userAvatar: string;
  assignedToId: string;   // ← NEW: so we know which user it’s assigned to
  fullname: string; // ← NEW: the user’s full name
}

interface AssigneeTypes {
  id: number;
  title: string;
  image: string;
}

const tasks: TaskTypes[] = [  
  // {
  //   id: 1,
  //   title: "iOS App home page",
  //   status: "Inprogress",
  //   category: "Design",
  //   variant: "text-danger bg-danger/25",
  //   dueDate: "13 Jul 2023",
  //   comments: 12,
  //   attachments: 12,
  //   userAvatar: avatar8,
  // },
  // {
  //   id: 2,
  //   title: "Topnav layout design",
  //   status: "Inprogress",
  //   category: "Web",
  //   variant: "text-gray-400 bg-gray-400/25",
  //   dueDate: "15 Jul 2023",
  //   comments: 4,
  //   attachments: 1,
  //   userAvatar: avatar4,
  // },
];

const assignees: AssigneeTypes[] = [
  // {
  //   id: 1,
  //   title: 'Coderthemes',
  //   image: avatar1,
  // },
  // {
  //   id: 2,
  //   title: 'Kenil Sudani',
  //   image: avatar2,
  // },
]

export { tasks, assignees };
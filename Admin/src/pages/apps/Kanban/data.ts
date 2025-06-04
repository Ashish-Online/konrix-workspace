// images
import avatar1 from '../../../assets/images/users/avatar-1.jpg'
import avatar2 from '../../../assets/images/users/avatar-2.jpg'
import avatar3 from '../../../assets/images/users/avatar-3.jpg'
import avatar4 from '../../../assets/images/users/avatar-4.jpg'
import avatar5 from '../../../assets/images/users/avatar-5.jpg'
import avatar6 from '../../../assets/images/users/avatar-6.jpg'

// Admin/src/pages/apps/Kanban/data.ts

export interface TaskTypes {
  id: string;            // Mongo _id
  title: string;
  status: string;

  // Add both:
  categoryId: string;    // the ObjectId of the category (for bucketing)
  categoryName: string;  // the human-readable name (for display)

  variant: string;
  dueDate: string;
  comments: number;
  attachments: number;
  userAvatar: string;
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
  // {
  //   id: 3,
  //   title: "Invite user to a project",
  //   status: "Inprogress",
  //   category: "Backend",
  //   variant: "text-success bg-success/25",
  //   dueDate: "12 Jul 2023",
  //   comments: 8,
  //   attachments: 6,
  //   userAvatar: avatar2,
  // },
  // {
  //   id: 15,
  //   title: "Hire new Developer",
  //   status: "New",
  //   category: "Wordpress",
  //   variant: "text-success bg-success/25",
  //   dueDate: "14 Jul 2023",
  //   comments: 46,
  //   attachments: 17,
  //   userAvatar: avatar3,
  // },
];

const assignees: AssigneeTypes[] = [
  {
    id: 1,
    title: 'Coderthemes',
    image: avatar1,
  },
  {
    id: 2,
    title: 'Kenil Sudani',
    image: avatar2,
  },
  {
    id: 3,
    title: 'Arya Stark',
    image: avatar3,
  },
  {
    id: 4,
    title: 'Jon Snow',
    image: avatar4,
  },
  {
    id: 5,
    title: 'Sansa Stark',
    image: avatar5,
  },
  {
    id: 6,
    title: 'Daenerys Targaryen',
    image: avatar6,
  },
]

export { tasks, assignees };
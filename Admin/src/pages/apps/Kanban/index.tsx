// Admin/src/pages/apps/Kanban/index.tsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import axios from "axios";

// components
import {
  CustomDatepicker,
  FormInput,
  PageBreadcrumb,
} from "../../../components";
import { ModalLayout } from "../../../components/HeadlessUI";
import TaskItem from "./TaskItem";

// **We no longer import hard-coded `tasks` or `assignees` from data.ts.**
// We'll fetch them dynamically from the backend.
import type { TaskTypes } from "./data";

// -------------------------------
// ——— TYPES & UTILITY FUNCTIONS —
// -------------------------------

interface StateType {
  newTasks: TaskTypes[];
  unassignedTasks: TaskTypes[];
  todoTasks: TaskTypes[];
  inprogressTasks: TaskTypes[];
  reviewTasks: TaskTypes[];
  doneTasks: TaskTypes[];
}

//
// Helper: take an array of raw tasks from the API and
// bucket them into our six state arrays based on `status`.
//
function bucketTasks(allTasks: TaskTypes[]): StateType {
  return {
    newTasks: allTasks.filter((t) => t.status === "New"),
    unassignedTasks: allTasks.filter((t) => t.status === "Unassigned"),
    todoTasks: allTasks.filter((t) => t.status === "Todo"),
    inprogressTasks: allTasks.filter((t) => t.status === "Inprogress"),
    reviewTasks: allTasks.filter((t) => t.status === "Review"),
    doneTasks: allTasks.filter((t) => t.status === "Done"),
  };
}

// -------------------------------------------------
// ——— VALIDATION SCHEMA (using yup) —
// -------------------------------------------------
const schemaResolver = yupResolver(
  yup.object().shape({
    title: yup.string().required("Title is required"),
    category: yup.string().required("Category is required"),
    comments: yup
      .number()
      .typeError("Comments must be a number")
      .required("Comments count is required"),
    attachments: yup
      .number()
      .typeError("Attachments must be a number")
      .required("Attachments count is required"),
    priority: yup.string().required("Priority is required"),
    assignTo: yup.string().required("Assignee is required"),
  })
);

// ------------------------------------
// ——— KANBAN APP COMPONENT ——————
// ------------------------------------
const KanbanApp = () => {
  // ——— REPLACE the old “state” + “bucketTasks” logic with this ———

  // 1) Keep a local array of all Category documents:
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );

  // 2) A mapping from categoryId → array of tasks in that category:
  const [columns, setColumns] = useState<{ [categoryId: string]: TaskTypes[] }>(
    {}
  );

  // ——— TOTAL COUNT ———
  const [totalTasks, setTotalTasks] = useState(0);

  // ——— MODAL + NEW TASK DETAILS ———
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [newTaskDetails, setNewTaskDetails] = useState<{
    status: string;
    queue: keyof StateType;
    dueDate: Date;
  } | null>(null);

  // ——— DYNAMIC USERS STATE ———
  const [users, setUsers] = useState<{ _id: string; fullname: string }[]>([]);

  // ——— REACT-HOOK-FORM SETUP ———
  const methods = useForm({ resolver: schemaResolver });
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = methods;

  // ——— ON MOUNT: FETCH TASKS & USERS ———
  // useEffect(() => {
  //   // Fetch Kanban tasks
  //   axios
  //     .post("http://localhost:5000/api/kanban/gettasks")
  //     .then((res) => {
  //       const allTasks: TaskTypes[] = res.data.map((t: any) => ({
  //         id: t._id,
  //         title: t.title,
  //         status: t.status,
  //         category: t.category,
  //         variant: t.priority,
  //         dueDate: t.dueDate,
  //         comments: t.comments,
  //         attachments: t.attachments,
  //       }));
  //       setState(bucketTasks(allTasks));
  //       setTotalTasks(allTasks.length);
  //     })
  //     .catch((err) => console.error("Error fetching Kanban tasks:", err));

  //   // Fetch all users for the “Assign To” dropdown:
  //   const getUsers = async () => {
  //     const res = await axios.get(`http://localhost:5000/api/users`);
  //     return res.data;
  //   };
  //   axios
  //     .get("http://localhost:5000/api/users")
  //     .then((res) => {
  //       // res.data is [ { _id, fullname, … }, … ]
  //       setUsers(
  //         res.data.map((u: any) => ({
  //           _id: u._id,
  //           fullname: u.fullname,
  //         }))
  //       );
  //       {
  //         console.log("Fetched users:", res.data);
  //       }
  //     })
  //     .catch((err) => console.error("Error fetching users:", err));
  // }, []);

  // ——— ON MOUNT: Fetch categories, users, and tasks ———

  useEffect(() => {
    // 1) Fetch ALL categories from backend:
    fetchCategories();

    // 2) Fetch all users for “Assign To”:
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => {
        setUsers(
          res.data.map((u: any) => ({
            _id: u._id,
            fullname: u.fullname,
          }))
        );
      })
      .catch((err) => console.error("Error fetching users:", err));

    // 3) Fetch all tasks and bucket them by category:
    fetchAllTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ——— Helper: re-usable function to GET /api/kanban/getcategories ———
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/kanban/getcategories"
      );
      // res.data should be an array of { _id, name }:
      setCategories(res.data);

      // Initialize columns mapping so every categoryId has an empty array first:
      const initialCols: { [key: string]: TaskTypes[] } = {};
      res.data.forEach((c: any) => {
        initialCols[c._id] = [];
      });
      setColumns(initialCols);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // ——— Helper: re-usable function to GET /api/kanban/gettasks and bucket by category ———
  const fetchAllTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/kanban/gettasks");
      // res.data is [ { _id, title, category (ObjectId), comments, attachments, priority, status, dueDate, assignedTo }, … ]
      const allTasks: TaskTypes[] = res.data.map((t: any) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        // Extract both the ObjectId and the name from the populated `t.category` object:
        categoryId: t.category?._id ?? "",
        categoryName: t.category?.name ?? "",
        variant: t.priority,
        dueDate: t.dueDate,
        comments: t.comments,
        attachments: t.attachments,
        userAvatar: "", // or fill in if you have one
      }));

      // Build a fresh mapping from catId → tasks[]
      const newCols: { [key: string]: TaskTypes[] } = {};
      categories.forEach((c) => {
        newCols[c._id] = [];
      });
      // If categories haven’t loaded yet, just create one bucket per task’s category:
      if (!categories.length) {
        // new:
        allTasks.forEach((task) => {
          const catId = task.categoryId; // the real ObjectId string
          if (!newCols[catId]) newCols[catId] = [];
          newCols[catId].push(task);
        });
      } else {
        // If categories are already known, push task into the right bucket
        allTasks.forEach((task) => {
          const cat = task.categoryId.toString();
          if (!newCols[cat]) {
            newCols[cat] = [];
          }
          newCols[cat].push(task);
        });
      }

      setColumns(newCols);
      setTotalTasks(allTasks.length);
    } catch (err) {
      console.error("Error fetching Kanban tasks:", err);
    }
  };

  // ——— OPEN “ADD TASK” MODAL ———
  function openNewTaskForm() {
    setNewTaskDetails({
      status: "New",
      queue: "newTasks",
      dueDate: new Date(),
    });
    setNewTaskModal(true);
  }

  function toggleNewTaskModal() {
    setNewTaskModal((prev) => !prev);
    if (newTaskModal) {
      reset();
      setNewTaskDetails(null);
    }
  }

  // ——— HANDLE “CREATE NEW TASK” ———
  const handleNewTask = async (values: any) => {
    if (!newTaskDetails) return;

    const parsedUser = JSON.parse(values.assignTo);
    const parsedCat = JSON.parse(values.category);

    const payload = {
      title: values.title,
      category: parsedCat.id, // <-- FIXED
      comments: values.comments,
      attachments: values.attachments,
      priority: values.priority,
      status: newTaskDetails.status,
      dueDate: newTaskDetails.dueDate.toISOString().split("T")[0],
      assignedTo: parsedUser.id,
    };

    try {
      // 1) Create new task (POST is correct here)
      await axios.post("http://localhost:5000/api/kanban/addtask", payload);

      // 2) Close modal + reset form
      toggleNewTaskModal();
      reset();

      // 3) Re-fetch via GET, not POST
      const res = await axios.get("http://localhost:5000/api/kanban/gettasks");
      const allTasks: TaskTypes[] = res.data.map((t: any) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        categoryId: t.category?._id ?? "",
        categoryName: t.category?.name ?? "",
        variant: t.priority,
        dueDate: t.dueDate,
        comments: t.comments,
        attachments: t.attachments,
        userAvatar: "",
      }));

      // 4) Bucket into columns
      const newCols: { [key: string]: TaskTypes[] } = {};
      categories.forEach((c) => (newCols[c._id] = []));
      allTasks.forEach((task) => {
        const catId = task.categoryId.toString();
        if (!newCols[catId]) newCols[catId] = [];
        newCols[catId].push(task);
      });
      setColumns(newCols);
      setTotalTasks(allTasks.length);
    } catch (err) {
      console.error("Error creating new task:", err);
    }
  };

  // ——— DRAG & DROP + getList, reorder, move … same as before ———

  // --------------------------------------
  // —— DRAG & DROP HELPERS (unchanged) ——
  // --------------------------------------
  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const move = (
    source: any[],
    destination: any[],
    droppableSource: { index: number; droppableId: string },
    droppableDestination: { index: number; droppableId: string }
  ) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);
    destClone.splice(droppableDestination.index, 0, removed);
    const result: any = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    return result;
  };

  // Helper to get tasks for a given categoryId from `columns`:
  const getList = (categoryId: string) => {
    return columns[categoryId] || [];
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // 1) Make a shallow copy of columns:
    const newCols = { ...columns };

    // 2) Same‐column reorder:
    if (source.droppableId === destination.droppableId) {
      const catId = source.droppableId;
      const items = reorder(newCols[catId], source.index, destination.index);
      newCols[catId] = items;
      setColumns(newCols);
      return;
    }

    // 3) Different‐column move:
    const fromCatId = source.droppableId;
    const toCatId = destination.droppableId;
    const sourceList = Array.from(newCols[fromCatId] || []);
    const destList = Array.from(newCols[toCatId] || []);
    // Remove the dragged item from sourceList:
    const [movedItem] = sourceList.splice(source.index, 1);
    // Insert it into destList:
    destList.splice(destination.index, 0, movedItem);
    newCols[fromCatId] = sourceList;
    newCols[toCatId] = destList;
    setColumns(newCols);
  };

  // --------------------------------------
  // —— RENDER ——
  // --------------------------------------
  return (
    <>
      <PageBreadcrumb
        title="Kanban"
        name="Kanban"
        breadCrumbItems={["Konrix", "Apps", "Kanban"]}
      >
        {/*— Existing “Add Task” button —*/}
        <button
          className="btn btn-sm bg-primary text-white"
          onClick={openNewTaskForm}
          type="button"
        >
          Add Task
        </button>

        {/*— New “Add Category” button —*/}
        <button
          className="btn btn-sm bg-secondary text-white ms-2"
          onClick={async () => {
            // Prompt the user for a category name:
            const name = prompt("Enter new category name:");
            if (!name || !name.trim()) {
              alert("Category name cannot be empty.");
              return;
            }

            try {
              // POST to /api/kanban/addcategory
              const res = await axios.post(
                "http://localhost:5000/api/kanban/addcategory",
                { name: name.trim() }
              );
              // On success, re-fetch categories so UI updates:
              await fetchCategories();
            } catch (err: any) {
              console.error("Error creating category:", err);
              alert("Failed to create category. See console for details.");
            }
          }}
          type="button"
        >
          Add Category
        </button>
      </PageBreadcrumb>

      <div className="grid h-full w-full">
        <div className="overflow-hidden text-gray-700 dark:text-slate-400">
          <div className="flex overflow-x-auto custom-scroll gap-6 pb-4">
            <DragDropContext onDragEnd={onDragEnd}>
              {categories.map((cat) => (
                <Droppable droppableId={cat._id} key={cat._id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      className="flex flex-col flex-shrink-0 w-72 border rounded-md overflow-hidden border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center flex-shrink-0 h-10 p-4 bg-white dark:bg-slate-800">
                        <span className="block text-sm font-semibold uppercase">
                          {cat.name} ({columns[cat._id]?.length || 0})
                        </span>
                      </div>
                      <div className="flex flex-col gap-4 overflow-auto p-4 h-[calc(100vh-300px)] kanban-board custom-scroll">
                        {(columns[cat._id] || []).map((item, idx) => (
                          <Draggable
                            draggableId={item.id + ""}
                            index={idx}
                            key={item.id}
                          >
                            {(provided, snapshot) => (
                              <div
                                className="card p-4 cursor-pointer"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskItem task={item} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* ——— MODAL FOR “CREATE NEW TASK” ——— */}
      <ModalLayout
        showModal={newTaskModal}
        toggleModal={toggleNewTaskModal}
        panelClassName="min-w-[800px] card !overflow-visible"
      >
        <div className="flex justify-between items-center py-3 px-6 border-b dark:border-gray-700">
          <h3 className="font-medium text-gray-600 dark:text-white text-base">
            Create New Task
          </h3>
          <button
            className="inline-flex flex-shrink-0 justify-center items-center h-8 w-8 dark:text-gray-200"
            type="button"
            onClick={toggleNewTaskModal}
          >
            <i className="mgc_close_line text-lg"></i>
          </button>
        </div>
        <div className="py-3 px-6 overflow-y-auto">
          <form onSubmit={handleSubmit(handleNewTask)}>
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
              <FormInput
                name="title"
                label="Title"
                placeholder="Enter Title"
                type="text"
                containerClass="space-y-1.5 mb-6 w-full"
                labelClassName="font-semibold text-gray-500"
                className="form-input"
                key="title"
                register={register}
                errors={errors}
                control={control}
              />
              <FormInput
                name="category"
                label="Categories"
                type="select"
                containerClass="space-y-1.5 mb-6 w-full"
                labelClassName="font-semibold text-gray-500"
                className="form-select"
                key="category"
                register={register}
                errors={errors}
                control={control}
                required
              >
                <option value="">— Select category —</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={JSON.stringify({ id: cat._id })}>
                    {cat.name}
                  </option>
                ))}
              </FormInput>
            </div>

            <div className="grid sm:grid-cols-3 grid-cols-1 gap-6">
              <FormInput
                name="comments"
                label="Comments"
                placeholder="0"
                type="number"
                containerClass="space-y-1.5 mb-6 w-full"
                labelClassName="font-semibold text-gray-500"
                className="form-input"
                key="comments"
                register={register}
                errors={errors}
                control={control}
                required
              />
              <FormInput
                name="attachments"
                label="Attachments"
                placeholder="0"
                type="number"
                containerClass="space-y-1.5 mb-6 w-full"
                labelClassName="font-semibold text-gray-500"
                className="form-input"
                key="attachments"
                register={register}
                errors={errors}
                control={control}
                required
              />
              <FormInput
                name="priority"
                label="Priority"
                type="select"
                containerClass="space-y-1.5 mb-6 w-full"
                labelClassName="font-semibold text-gray-500"
                className="form-select"
                key="priority"
                register={register}
                errors={errors}
                control={control}
                required
              >
                <option value="text-success bg-success/25">Low</option>
                <option value="text-amber-500 bg-amber-500/25">Medium</option>
                <option value="text-danger bg-danger/25">High</option>
              </FormInput>
            </div>

            <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
              <FormInput
                name="assignTo"
                label="Assign To"
                type="select"
                containerClass="space-y-1.5 mb-6 w-full"
                labelClassName="font-semibold text-gray-500"
                className="form-select"
                register={register}
                errors={errors}
                control={control}
                required
              >
                <option value="">— Select user —</option>
                {users.map((u) => (
                  <option key={u._id} value={JSON.stringify({ id: u._id })}>
                    {u.fullname}
                  </option>
                ))}
              </FormInput>

              <div className="space-y-1.5 mb-6 w-full">
                <label htmlFor="task-duedate" className="form-label block">
                  Due Date
                </label>
                <CustomDatepicker
                  hideAddon
                  dateFormat="yyyy-MM-dd"
                  value={newTaskDetails?.dueDate}
                  inputClass="form-input"
                  onChange={(date) => {
                    if (newTaskDetails) {
                      setNewTaskDetails({
                        ...newTaskDetails,
                        dueDate: date,
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 p-2 border-t dark:border-slate-700">
              <button
                className="btn bg-light text-gray-800 transition-all"
                onClick={toggleNewTaskModal}
                type="button"
              >
                Close
              </button>
              <button type="submit" className="btn bg-primary text-white">
                Create
              </button>
            </div>
          </form>
        </div>
      </ModalLayout>
    </>
  );
};

export default KanbanApp;

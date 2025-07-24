/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, updateTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { Header } from './Components/Header';
import { Footer } from './Components/Footer';
import { TodoList } from './Components/TodoList';
import { Notifications } from './Components/Notifications';
import { FilterStatus } from './types/FilterStatus';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [title, setTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState(FilterStatus.All);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [processingIds, setProcessingIds] = useState<Todo['id'][]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setErrorMessage('');
    getTodos()
      .then(setTodos)
      .catch(error => {
        setErrorMessage('Unable to load todos');
        throw error;
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);

      return () => clearTimeout(timer);
    }

    return;
  }, [errorMessage]);

  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => inputRef.current?.focus();

  const handleToggle = async (todo: Todo) => {
    const updatedTodo = {
      ...todo,
      completed: editingTitle ? todo.completed : !todo.completed,
      title: editingTitle ? editingTitle.trim() : todo.title,
    };

    setProcessingIds(prev => [...prev, todo.id]);

    updateTodo(todo.id, updatedTodo)
      .then(updated => {
        setTodos(currentTodos =>
          currentTodos.map(t => (t.id === todo.id ? updated : t)),
        );
        setEditingTitle('');
        setEditingTodoId(null);
      })
      .catch(() => setErrorMessage('Unable to update a todo'))
      .finally(() => {
        setProcessingIds(prev => prev.filter(id => id !== todo.id));
        focusInput();
      });
  };

  const handleToggleAll = async () => {
    const hasUncompleted = todos.some(todo => !todo.completed);

    const todosToUpdate = hasUncompleted
      ? todos.filter(todo => !todo.completed)
      : todos;

    for (const todo of todosToUpdate) {
      await handleToggle(todo);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const filteredTodos = todos.filter(todo => {
    if (filterStatus === 'active') {
      return !todo.completed;
    }

    if (filterStatus === 'completed') {
      return todo.completed;
    }

    return true; // 'all'
  });

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          title={title}
          setTitle={setTitle}
          setTodos={setTodos}
          setErrorMessage={setErrorMessage}
          setTempTodo={setTempTodo}
          setProcessingIds={setProcessingIds}
          setIsAdding={setIsAdding}
          isAdding={isAdding}
          inputRef={inputRef}
          focusInput={focusInput}
          handleToggleAll={handleToggleAll}
          isLoading={isLoading}
        />

        {todos.length > 0 && (
          <>
            <TodoList
              filteredTodos={filteredTodos}
              tempTodo={tempTodo}
              processingIds={processingIds}
              setProcessingIds={setProcessingIds}
              setErrorMessage={setErrorMessage}
              setTodos={setTodos}
              focusInput={focusInput}
              handleToggle={handleToggle}
              editingTodoId={editingTodoId}
              setEditingTodoId={setEditingTodoId}
              editingTitle={editingTitle}
              setEditingTitle={setEditingTitle}
            />
          </>
        )}

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <Footer
            todos={todos}
            setFilterStatus={setFilterStatus}
            filterStatus={filterStatus}
            setProcessingIds={setProcessingIds}
            setTodos={setTodos}
            setErrorMessage={setErrorMessage}
            focusInput={focusInput}
          />
        )}
      </div>

      <Notifications
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};

/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
// import React from 'react';
// import { UserWarning } from './UserWarning';
// import { USER_ID } from './api/todos';

// export const App: React.FC = () => {
//   if (!USER_ID) {
//     return <UserWarning />;
//   }

//   return (
//     <div className="todoapp">
//       <h1 className="todoapp__title">todos</h1>

//       <div className="todoapp__content">
//         <header className="todoapp__header">
//           {/* this button should have `active` class only if all todos are completed */}
//           <button
//             type="button"
//             className="todoapp__toggle-all active"
//             data-cy="ToggleAllButton"
//           />

//           {/* Add a todo on form submit */}
//           <form>
//             <input
//               data-cy="NewTodoField"
//               type="text"
//               className="todoapp__new-todo"
//               placeholder="What needs to be done?"
//             />
//           </form>
//         </header>

//         <section className="todoapp__main" data-cy="TodoList">
//           {/* This is a completed todo */}
//           <div data-cy="Todo" className="todo completed">
//             <label className="todo__status-label">
//               <input
//                 data-cy="TodoStatus"
//                 type="checkbox"
//                 className="todo__status"
//                 checked
//               />
//             </label>

//             <span data-cy="TodoTitle" className="todo__title">
//               Completed Todo
//             </span>

//             {/* Remove button appears only on hover */}
//             <button type="button" className="todo__remove" data-cy="TodoDelete">
//               ×
//             </button>

//             {/* overlay will cover the todo while it is being deleted or updated */}
//             <div data-cy="TodoLoader" className="modal overlay">
//               <div className="modal-background has-background-white-ter" />
//               <div className="loader" />
//             </div>
//           </div>

//           {/* This todo is an active todo */}
//           <div data-cy="Todo" className="todo">
//             <label className="todo__status-label">
//               <input
//                 data-cy="TodoStatus"
//                 type="checkbox"
//                 className="todo__status"
//               />
//             </label>

//             <span data-cy="TodoTitle" className="todo__title">
//               Not Completed Todo
//             </span>
//             <button type="button" className="todo__remove" data-cy="TodoDelete">
//               ×
//             </button>

//             <div data-cy="TodoLoader" className="modal overlay">
//               <div className="modal-background has-background-white-ter" />
//               <div className="loader" />
//             </div>
//           </div>

//           {/* This todo is being edited */}
//           <div data-cy="Todo" className="todo">
//             <label className="todo__status-label">
//               <input
//                 data-cy="TodoStatus"
//                 type="checkbox"
//                 className="todo__status"
//               />
//             </label>

//             {/* This form is shown instead of the title and remove button */}
//             <form>
//               <input
//                 data-cy="TodoTitleField"
//                 type="text"
//                 className="todo__title-field"
//                 placeholder="Empty todo will be deleted"
//                 value="Todo is being edited now"
//               />
//             </form>

//             <div data-cy="TodoLoader" className="modal overlay">
//               <div className="modal-background has-background-white-ter" />
//               <div className="loader" />
//             </div>
//           </div>

//           {/* This todo is in loadind state */}
//           <div data-cy="Todo" className="todo">
//             <label className="todo__status-label">
//               <input
//                 data-cy="TodoStatus"
//                 type="checkbox"
//                 className="todo__status"
//               />
//             </label>

//             <span data-cy="TodoTitle" className="todo__title">
//               Todo is being saved now
//             </span>

//             <button type="button" className="todo__remove" data-cy="TodoDelete">
//               ×
//             </button>

//             {/* 'is-active' class puts this modal on top of the todo */}
//             <div data-cy="TodoLoader" className="modal overlay is-active">
//               <div className="modal-background has-background-white-ter" />
//               <div className="loader" />
//             </div>
//           </div>
//         </section>

//         {/* Hide the footer if there are no todos */}
//         <footer className="todoapp__footer" data-cy="Footer">
//           <span className="todo-count" data-cy="TodosCounter">
//             3 items left
//           </span>

//           {/* Active link should have the 'selected' class */}
//           <nav className="filter" data-cy="Filter">
//             <a
//               href="#/"
//               className="filter__link selected"
//               data-cy="FilterLinkAll"
//             >
//               All
//             </a>

//             <a
//               href="#/active"
//               className="filter__link"
//               data-cy="FilterLinkActive"
//             >
//               Active
//             </a>

//             <a
//               href="#/completed"
//               className="filter__link"
//               data-cy="FilterLinkCompleted"
//             >
//               Completed
//             </a>
//           </nav>

//           {/* this button should be disabled if there are no completed todos */}
//           <button
//             type="button"
//             className="todoapp__clear-completed"
//             data-cy="ClearCompletedButton"
//           >
//             Clear completed
//           </button>
//         </footer>
//       </div>

//       {/* DON'T use conditional rendering to hide the notification */}
//       {/* Add the 'hidden' class to hide the message smoothly */}
//       <div
//         data-cy="ErrorNotification"
//         className="notification is-danger is-light has-text-weight-normal"
//       >
//         <button data-cy="HideErrorButton" type="button" className="delete" />
//         {/* show only one message at a time */}
//         Unable to load todos
//         <br />
//         Title should not be empty
//         <br />
//         Unable to add a todo
//         <br />
//         Unable to delete a todo
//         <br />
//         Unable to update a todo
//       </div>
//     </div>
//   );
// };

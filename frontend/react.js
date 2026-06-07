/* *******************************************************************************************
 * REACT.JS CHEATSHEET — Modern (React 18/19)
 * DOCUMENTATION: https://react.dev
 * ******************************************************************************************* */

// The modern React is functional with Hooks. Class components are legacy.
// React 19 introduces: Actions, use(), server components stable, new hooks

/* ===========================================================================================
 * SETUP & TOOLING
 * =========================================================================================== */

// Create React App (CRA) is deprecated. Use:
//   npx create-vite@latest my-app --template react-ts     # Vite (recommended)
//   npx create-next-app@latest my-app                      # Next.js (full framework)
//   npx create-react-app my-app                             # Legacy (do not use for new)

// npm create vite@latest my-app -- --template react
// npm create vite@latest my-app -- --template react-ts    # TypeScript

/* ===========================================================================================
 * FUNCTIONAL COMPONENTS (Modern)
 * =========================================================================================== */

// Basic component
function Welcome({ name, age }) {
  return <h1>Hello, {name}!</h1>;
}

// Arrow function component with TypeScript
import type { FC, ReactNode } from 'react';

interface Props {
  title: string;
  children?: ReactNode;
  onAction?: () => void;
}

const Card: FC<Props> = ({ title, children, onAction }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
      {onAction && <button onClick={onAction}>Go</button>}
    </div>
  );
};

// Export default vs named
export default Card;
export { Welcome, Card };

/* ===========================================================================================
 * REACT 19 — use() HOOK (Data Loading without extra state)
 * =========================================================================================== */

// React 19: `use()` reads a promise or context directly in render
// No need for useState + useEffect for data fetching in some cases
// import { use } from 'react';

// function Comments({ commentsPromise }) {
//   const comments = use(commentsPromise);  // Suspense-aware
//   return <ul>{comments.map(c => <li key={c.id}>{c.text}</li>)}</ul>;
// }

// Works with context too:
// const theme = use(ThemeContext);

/* ===========================================================================================
 * HOOKS — Core
 * =========================================================================================== */

import { useState, useEffect, useRef, useMemo, useCallback, useContext, useReducer, useId } from 'react';

/* --- useState --- */
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);
const [form, setForm] = useState({ name: '', email: '' });

// Functional update (preferred when new state depends on old)
setCount(prev => prev + 1);

// Updating object state (spread to keep other fields)
setForm(prev => ({ ...prev, name: 'Alice' }));

/* --- useEffect --- */
useEffect(() => {
  // Runs after render (side effects: fetch, subscriptions, DOM, timers)
  document.title = `Count: ${count}`;

  return () => {
    // Cleanup (runs on unmount + before re-run)
    document.title = 'React App';
  };
}, [count]); // Re-run when `count` changes. Empty [] = mount only. Omit = every render.

// Data fetching pattern
useEffect(() => {
  let cancelled = false;
  async function load() {
    const data = await fetch(`/api/user/${id}`).then(r => r.json());
    if (!cancelled) setUser(data);
  }
  load();
  return () => { cancelled = true; };
}, [id]);

/* --- useRef --- */
// Mutable ref that persists across renders (doesn't trigger re-render)
const inputRef = useRef(null);
const intervalRef = useRef(null);

// Access DOM element
<input ref={inputRef} />;
inputRef.current.focus();

// Store mutable value
intervalRef.current = setInterval(() => {}, 1000);

/* --- useMemo --- */
// Memoize expensive computation
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]); // Only re-compute when `items` changes

/* --- useCallback --- */
// Memoize function reference (prevents unnecessary re-renders in children)
const handleSave = useCallback(async (data) => {
  await api.save(data);
}, []); // Dependencies: if it uses props/state, list them

/* --- useContext --- */
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Content</div>;
}

/* --- useReducer --- */
// For complex state logic (like Redux but local)
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'reset':     return initialState;
    default: throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}

/* --- useId --- */
// Generate unique IDs for accessibility (React 18+)
const id = useId();
// <label htmlFor={id}>Name</label>
// <input id={id} type="text" />

/* ===========================================================================================
 * CUSTOM HOOKS
 * =========================================================================================== */

// Encapsulate reusable logic
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Usage: const [theme, setTheme] = useLocalStorage('theme', 'light');

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

/* ===========================================================================================
 * REACT 18 FEATURES
 * =========================================================================================== */

// 1. Automatic Batching — multiple setState calls batch into one re-render
//    Previously only batched in event handlers. Now batches in setTimeout, promises, etc.
//    setCount(c => c + 1);
//    setFlag(f => !f);
//    // Single re-render

// 2. Transitions — mark non-urgent updates
import { startTransition } from 'react';

// Urgent: show what user typed
setInput(value);

// Non-urgent: filter large list (can be interrupted)
startTransition(() => {
  setFilterResults(value);
});

// useTransition hook
const [isPending, startTransition] = useTransition();
// isPending is true while transition is running

// 3. Suspense — declarative loading states
import { Suspense } from 'react';

<Suspense fallback={<Spinner />}>
  <SlowComponent />   {/* Can suspend (e.g., use() or lazy()) */}
</Suspense>

// Nested Suspense for granular loading
<Suspense fallback={<HeaderSkeleton />}>
  <Header />
  <Suspense fallback={<ContentSkeleton />}>
    <Content />
  </Suspense>
</Suspense>

// 4. ReactDOM.createRoot (new in 18 — replaces ReactDOM.render)
//    import { createRoot } from 'react-dom/client';
//    const root = createRoot(document.getElementById('root'));
//    root.render(<App />);

// 5. StrictMode (double-invoke effects in dev — helps find bugs)
//    <StrictMode><App /></StrictMode>

/* ===========================================================================================
 * REACT 19 FEATURES
 * =========================================================================================== */

// 1. Actions — async transitions with form handling
// function Form() {
//   const [isPending, startTransition] = useTransition();
//
//   async function handleSubmit(formData) {
//     startTransition(async () => {
//       await submitToServer(formData);
//     });
//   }
//
//   return (
//     <form action={handleSubmit}>
//       <input name="email" type="email" required />
//       <button type="submit" disabled={isPending}>
//         {isPending ? 'Saving...' : 'Save'}
//       </button>
//     </form>
//   );
// }

// 2. useFormStatus — access form state from within a form
//    import { useFormStatus } from 'react-dom';
//    function SubmitButton() {
//      const { pending } = useFormStatus();
//      return <button disabled={pending}>{pending ? '...' : 'Submit'}</button>;
//    }

// 3. useOptimistic — optimistic UI updates
//    const [optimisticMessages, addOptimistic] = useOptimistic(
//      messages,
//      (state, newMsg) => [...state, { text: newMsg, sending: true }]
//    );

// 4. Server Components (concept — see Next.js section)
//    Rendered on server, sent as HTML/stream. Zero client JS for static parts.
//    "use client" directive marks client-side components.

// 5. ref as prop — no more forwardRef needed
//    function Input({ ref, ...props }) {
//      return <input ref={ref} {...props} />;
//    }

// 6. Better <Context.Provider> — children required removed

/* ===========================================================================================
 * PERFORMANCE PATTERNS
 * =========================================================================================== */

// React.memo — prevent re-render if props unchanged
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  return items.map(item => <li key={item.id}>{item.name}</li>);
});

// useMemo — memoize computation (see above)
// useCallback — memoize function (see above)

// Lazy loading code-split components
import { lazy } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
// Wrap in <Suspense> when rendering

// Virtualization for long lists (use react-window or @tanstack/react-virtual)
// import { FixedSizeList } from 'react-window';
// <FixedSizeList height={400} itemCount={10000} itemSize={35}>
//   {({ index, style }) => <div style={style}>Row {index}</div>}
// </FixedSizeList>

/* ===========================================================================================
 * STATE MANAGEMENT (Modern)
 * =========================================================================================== */

// 1. useState + useReducer + Context — built-in, enough for most apps

// 2. Zustand — minimal, no boilerplate
//    import { create } from 'zustand';
//    const useStore = create((set) => ({
//      count: 0,
//      increment: () => set((state) => ({ count: state.count + 1 })),
//    }));
//    function Counter() {
//      const { count, increment } = useStore();
//      return <button onClick={increment}>{count}</button>;
//    }

// 3. TanStack Query (React Query) — server state
//    import { useQuery, useMutation } from '@tanstack/react-query';
//    const { data, isLoading } = useQuery({
//      queryKey: ['users'],
//      queryFn: () => fetch('/api/users').then(r => r.json()),
//    });

// 4. tRPC — end-to-end typesafe APIs (no schema/contract duplication)
//    import { trpc } from '../utils/trpc';
//    function MyComponent() {
//      const { data } = trpc.user.getById.useQuery({ id: 1 });
//      const mutation = trpc.user.create.useMutation();
//      return <button onClick={() => mutation.mutate({ name: 'Alice' })}>Create</button>;
//    }

/* ===========================================================================================
 * STYLING (Modern)
 * =========================================================================================== */

// 1. CSS Modules (built-in with Vite/Next.js)
//    import styles from './Card.module.css';
//    <div className={styles.card}>...</div>

// 2. Tailwind CSS — utility-first
//    <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow">

// 3. CSS-in-JS (styled-components, emotion — less trendy now)
//    import styled from 'styled-components';
//    const Button = styled.button`background: blue;`;

/* ===========================================================================================
 * FORMS (Modern)
 * =========================================================================================== */

// Controlled (React manages state)
function ControlledForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
    </form>
  );
}

// Uncontrolled (DOM manages state — use ref)
function UncontrolledForm() {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="initial" />
    </form>
  );
}

// React Hook Form (recommended for complex forms)
// import { useForm } from 'react-hook-form';
// const { register, handleSubmit, formState: { errors } } = useForm();
// <input {...register('email', { required: true })} />
// {errors.email && <span>Required</span>}

/* ===========================================================================================
 * ERROR BOUNDARIES
 * =========================================================================================== */

// Error boundaries must be class components (or use react-error-boundary package)
import { ErrorBoundary } from 'react-error-boundary';

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Usage:
// <ErrorBoundary FallbackComponent={Fallback} onReset={() => setKey(k => k + 1)}>
//   <MyComponent />
// </ErrorBoundary>

/* ===========================================================================================
 * TESTING (Modern)
 * =========================================================================================== */

// Vitest + React Testing Library (preferred)
// npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event

// import { render, screen, fireEvent } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
//
// test('renders welcome', () => {
//   render(<Welcome name="Alice" />);
//   expect(screen.getByText('Hello, Alice!')).toBeInTheDocument();
// });
//
// test('button click', async () => {
//   const user = userEvent.setup();
//   render(<Counter />);
//   await user.click(screen.getByText('+'));
//   expect(screen.getByText('1')).toBeInTheDocument();
// });

/* ===========================================================================================
 * COMMON PATTERNS
 * =========================================================================================== */

// Conditional rendering
{isLoggedIn && <Dashboard />}
{isLoading ? <Spinner /> : <Data />}
{error ? <Error msg={error} /> : null}

// Lists + keys
{items.map(item => <div key={item.id}>{item.name}</div>)}
// Never use index as key if list can change order

// Event handling
<button onClick={(e) => handleClick(e, id)}>Delete</button>

// Prevent default
function handleSubmit(e) {
  e.preventDefault();
}

// Children prop pattern
function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// Render props (legacy — prefer hooks)
// portal
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.body
  );
}

/* ===========================================================================================
 * TYPESCRIPT WITH REACT
 * =========================================================================================== */

// Component with props
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, variant = 'primary', disabled, onClick }) => {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
};

// Event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget);
};

// useRef with element
const divRef = useRef<HTMLDivElement>(null);

// Children type
type PropsWithChildren = {
  children: React.ReactNode;
};

/* ===========================================================================================
 * LEGACY — CLASS COMPONENTS (for reference on older codebases)
 * =========================================================================================== */

// Not recommended for new code. Use functional components + hooks instead.
//
// class Welcome extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { count: 0 };
//   }
//
//   componentDidMount() { /* similar to useEffect([], []) */ }
//   componentDidUpdate(prevProps, prevState) { /* similar to useEffect */ }
//   componentWillUnmount() { /* cleanup */ }
//
//   render() {
//     return <h1>Hello, {this.props.name}</h1>;
//   }
// }

import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StudentDirectoryPage from './pages/StudentDirectoryPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ClassSchedulePage from './pages/ClassSchedulePage';
import EventsPage from './pages/EventsPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <ProfileSetupModal />
      <Toaster />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/students',
  component: StudentDirectoryPage,
});

const announcementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/announcements',
  component: AnnouncementsPage,
});

const schedulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedules',
  component: ClassSchedulePage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: EventsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  studentsRoute,
  announcementsRoute,
  schedulesRoute,
  eventsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

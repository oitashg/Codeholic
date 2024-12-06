import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home"
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Contact from './pages/Contact';
import OpenRoute from './components/core/Auth/OpenRoute';
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Error from './pages/Error';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import VerifyEmail from './pages/VerifyEmail';
import MyProfile from './components/core/Dashboard/MyProfile';
import Dashboard from './pages/Dashboard';
import Settings from './components/core/Dashboard/Settings';
import EnrolledCourses from './components/core/Dashboard/EnrolledCourses';
import Cart from './components/core/Dashboard/Cart';
import { useSelector } from 'react-redux';
import { ACCOUNT_TYPE } from './utils/constants';
import AddCourse from './components/core/Dashboard/AddCourse';
import MyCourses from './components/core/Dashboard/MyCourses';
import EditCourse from './components/core/Dashboard/EditCourse';
import Catalog from './pages/Catalog';
import CourseDetails from './pages/CourseDetails';
import VideoDetails from './components/core/ViewCourse/VideoDetails';
import ViewCourse from './pages/ViewCourse';
import Instructor from './components/core/Dashboard/InstructorDashboard/Instructor';
import {Analytics} from "@vercel/analytics/react"

function App() {

  const {user} = useSelector((state) => state.profile)
  
  return (
    <div className='w-screen min-h-screen bg-richblack-900 flex-col font-inter'>
      {/* Under BrowserRouter, there is "Routes" then under that there are many individual "Route" */}
      {/* Navbar is common for all pages, it will be at the top. So, it is written in App.js */}
      <Navbar/>

      {/* All routes should be added in App.js only for moving from one page to other */}
      {/* Routes directing to respective pages are given here */}
      <Routes>
        <Route path='/' element={<Home/>}/>

        {/* Route for respective catagories */}
        <Route path='catalog/:catalogName' element={<Catalog/>}/>
        <Route path='courses/:courseId' element={<CourseDetails/>}/>

        {/* Wrapped in openRoute so that everyone can visit */}
        <Route 
          path='/login' 
          element={
            <OpenRoute>
              <Login/>
            </OpenRoute>
          }
        />

        {/* Wrapped in openRoute so that everyone can visit */}
        <Route 
          path='/signup' 
          element={
            <OpenRoute>
              <Signup/>
            </OpenRoute>
          }
        />
        
        <Route 
          path='/forgot-password' 
          element={
            <OpenRoute>
              <ForgotPassword/>
            </OpenRoute>
          }
        />

        <Route 
          path='/verify-email' 
          element={
            <OpenRoute>
              <VerifyEmail/>
            </OpenRoute>
          }
        />

        <Route 
          path='/update-password/:id' 
          element={
            <OpenRoute>
              <UpdatePassword/>
            </OpenRoute>
          }
        />

        {/* About and contact must be kept as a normal route as it can be visited by any user at any time 
        whether logged in or logged out or authorized or unauthorized */}
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        
        {/* Dashboard route has other nested routes
        Parent is dashboard inside which there are other routes
        Dashboard comes under PrivateRoute as other people can't access this */}
        <Route 
          element={
            <PrivateRoute>
              <Dashboard/>
            </PrivateRoute>
          }
        >
          <Route path='dashboard/my-profile' element={<MyProfile/>}/>
          <Route path='dashboard/settings' element={<Settings/>}/>
          
          {
            //If this validation is not added, then instructor can also open enrolled-courses and cart page which is logically wrong
            //That's why this validation is added
            //Always add ? to ensure whether accountType is present or not
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route path='dashboard/enrolled-courses' element={<EnrolledCourses/>}/>
                {/* <Route path='dashboard/cart' element={<Cart/>}/> */}
              </>
            )
          }


          {
            //If this validation is not added, then instructor can also open ebrolled-courses and cart page which is logically wrong
            //That's why this validation is added
            //Always add ? to ensure whether accountType is present or not
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route path='dashboard/instructor' element={<Instructor/>}/>
                <Route path='dashboard/add-course' element={<AddCourse/>}/>
                <Route path='dashboard/my-courses' element={<MyCourses/>}/>
                <Route path='dashboard/edit-course/:courseId' element={<EditCourse/>}/>
              </>
            )
          }

        </Route>

        <Route element={
          <PrivateRoute>
            <ViewCourse/>
          </PrivateRoute>
        }>
          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route
                  path='view-course/:courseId/section/:sectionId/sub-section/:subSectionId'
                  element={<VideoDetails/>}/>
              </>
            )
          }
        </Route>

        {/* If unknown route then show error page */}
        <Route path='*' element={<Error/>}/>
      </Routes>
      <Analytics/>
    </div>
  );
}

export default App;

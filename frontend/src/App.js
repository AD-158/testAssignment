import {Routes, Route, Navigate, useLocation} from "react-router-dom";
import React from "react";
import './App.css';
import PrivateRoute from './utils/PrivateRoute'
import AuthContext from './context/AuthContext'
import MyNavbar from "./components/MyNavbar";
import LoginPage from './pages/LoginPage'
import EmployeesPage from './pages/EmployeesPage';
import PositionsPage from "./pages/PositionsPage";

export const MyContext = React.createContext();

const usePrevious = (value) => {
    const ref = React.useRef()
    React.useEffect(() => {
        ref.current = value.replaceAll('/', '');
    })
    return ref.current
}

export default function App() {
    let {user} = React.useContext(AuthContext)
    // const theme = useTheme();
    const [light, setLight] = React.useState(true);
    const [open, setOpen] = React.useState(false);
    const [width, setWidth] = React.useState(0)
    const [height, setHeight] = React.useState(0)
    const location = useLocation().pathname.replaceAll('/', '');
    const prevLocation = usePrevious(location);
    const [selectedIndex, setSelectedIndex] = React.useState(location);
    const [searchValue, setSearchValue] = React.useState("");

    let updateDimensions = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    React.useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions)
    }, []);

    React.useEffect(() => {
        return () => {
            window.removeEventListener('resize', updateDimensions)
        }
    }, []);

    function handler(open) {
        setOpen(!open)
    }

    const handleListItemClick = (index) => {
        setSelectedIndex(index);
    };
    const LocationChange = (location, prevLocation) => {
        React.useEffect(() => {
            if (prevLocation !== undefined) {
                if (prevLocation !== location) {
                    console.log('changed from', prevLocation, 'to', location)
                    setSelectedIndex(location)
                }
            }
        }, [location, prevLocation])
    }

    LocationChange(location, prevLocation);

    document.querySelector("meta[name='viewport']").setAttribute('content',
        'width=device-width, height=device-height, initial-scale=1')

    return (
        <>
            <MyNavbar open={open} handler={handler} handleListItemClick={handleListItemClick}
                      selectedIndex={selectedIndex} setSearchValue={setSearchValue}/>
            <main role="main">
                <MyContext.Provider value={searchValue}>
                    <Routes>
                        <Route path='/' element={<PrivateRoute/>}>
                            <Route path='/employees' element={<EmployeesPage searchValue={searchValue}/>}/>
                        </Route>
                        <Route path='/' element={<PrivateRoute/>}>
                            <Route path='/positions' element={<PositionsPage searchValue={searchValue}/>}/>
                        </Route>
                        {/*<Route exact path='/register' element={<Register/>}/>*/}
                        <Route path='/login' element={user ? <Navigate to="/employees" replace/> : <LoginPage/>}/>
                        <Route path="*" element={<Navigate to="/employees" replace/>}/>
                    </Routes>
                </MyContext.Provider>
            </main>
        </>
    );
}
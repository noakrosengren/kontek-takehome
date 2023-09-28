import { useState } from 'react'
import './App.css'
import Cookies from 'js-cookie';

function App() {
  const baseURI = 'http://localhost:8010/proxy'
  const token = Cookies.get('token');

  //Auth
  const [apiToken, setApiToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  //EmployeeInfo
  const [employeeId, setEmployeeId] = useState('1002');
  const [companyId, setCompanyId] = useState('999991000000000100');
  const [internalEmployeeId, setInternalEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('none')
  const [employeeData, setEmployeeData] = useState();
  const [employeeInfoLoading, setEmployeeInfoLoading] = useState(false);

  //Adress info
  const [streetAddress, setStreetAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setcity] = useState('');
  const [adressLoading, setAdressLoading] = useState(false);

  const handleSubmitAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    const response = await fetch(`${baseURI}/openApi/v4/auth/getToken`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "Key": apiToken
      },
      body: JSON.stringify({
        userName: username,
        passWord: password
      })
    })
    if (response.status === 200) {
      const body = await response.json();
      Cookies.set('token', body.entity, { expires: 1 / 48 }); //1/48 of a day is 30 minutes
    }
    setAuthLoading(false);
  }
  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    setEmployeeInfoLoading(true);

    const response = await fetch(`${baseURI}/openApi/v4/company/${companyId}/employee?employeeId=${employeeId}`, {
      headers: {
        "Content-Type": 'application/json',
        "Token": token
      }
    })

    if (response.status === 200) {
      const body = await response.json();
      const entity = body.entity[0];
      setEmployeeData(entity);
      const { internalEmployeeId, firstName, streetAddress, zipCode, city } = entity

      setInternalEmployeeId(internalEmployeeId);
      setFirstName(firstName);
      setStreetAddress(streetAddress);
      setZipCode(zipCode);
      setcity(city);
    }
    setEmployeeInfoLoading(false);
  }
  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setAdressLoading(true);

    if (!employeeData) { //extra careful not to overwrite without data
      alert('First Fetch data to update');
      return
    }

    const updatedEmployeeData = {
      ...employeeData,
      streetAddress,
      zipCode,
      city
    }
    const response = await fetch(`${baseURI}/openApi/v4/company/${companyId}/employee/${internalEmployeeId}`, {
      method: 'PUT',
      headers: {
        "Content-Type": 'application/json',
        "Token": token
      },
      body: JSON.stringify(updatedEmployeeData)
    })
    if (response.status === 200) {
      alert('Succesfully uppdated address');
    }
    setAdressLoading(false);
  }

  return (
    <>
      {!token && <div className="formStyle">
        <h2>Authentication</h2>
        <form onSubmit={handleSubmitAuth}>
          <label htmlFor="apiToken">Apitoken</label>
          <input
            id="apiToken"
            type="text"
            required
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
          />
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={authLoading}>Authenticate</button>
        </form>
      </div>}
      {token && <div className="grid-container">
        <div className="formStyle">
          <h2>User Info</h2>
          <form onSubmit={handleSubmitInfo}>
            <label htmlFor="employeeId">Employee Id</label>
            <input
              id="employeeId"
              type="text"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
            <label htmlFor="companyId">Company Id</label>
            <input
              id="companyId"
              type="text"
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            />
            <button disabled={employeeInfoLoading}>Get Employee Data</button>
          </form>
          <p>Current employee: {firstName}</p>
        </div>
        <div className="formStyle">
          <h2>Address</h2>
          <form onSubmit={handleSubmitAddress} disabled={true}>
            <label htmlFor="streetAddress">Street Address</label>
            <input
              id="streetAddress"
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
            <label htmlFor="zipCode">Zip Code</label>
            <input
              id="zipCode"
              type="text"
              required
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              required
              value={city}
              onChange={(e) => setcity(e.target.value)}
            />
            <button disabled={adressLoading || !employeeData}>Update Employee Address</button>
          </form>
        </div>
      </div>}
    </>
  )
}

export default App

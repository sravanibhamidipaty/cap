import { useEffect, useState } from 'react'
import APIForm from './components/APIForm'
import Gallery from './components/Gallery'
import './App.css'

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY

const emptyInputs = {
  url: '',
  format: '',
  no_ads: '',
  no_cookie_banners: '',
  width: '',
  height: '',
}

const defaultValues = {
  format: 'jpeg',
  no_ads: 'true',
  no_cookie_banners: 'true',
  width: '1920',
  height: '1080',
}

function App() {
  const [inputs, setInputs] = useState(emptyInputs)
  const [currentImage, setCurrentImage] = useState(null)
  const [prevImages, setPrevImages] = useState([])
  const [quota, setQuota] = useState(null)

  const handleChange = (event) => {
    setInputs((previousInputs) => ({
      ...previousInputs,
      [event.target.name]: event.target.value.trim(),
    }))
  }

  const reset = () => setInputs(emptyInputs)

  const getQuota = async () => {
    try {
      const response = await fetch(
        `https://api.apiflash.com/v1/urltoimage/quota?access_key=${ACCESS_KEY}`,
      )
      const result = await response.json()

      if (response.ok && typeof result.remaining === 'number') {
        setQuota(result)
      }
    } catch (error) {
      console.error('Unable to retrieve the ApiFlash quota.', error)
    }
  }

  useEffect(() => {
    getQuota()
  }, [])

  const callAPI = async (query) => {
    try {
      const response = await fetch(query)
      const json = await response.json()

      if (!response.ok || !json.url) {
        alert("Oops! Something went wrong with that query, let's try again!")
        return
      }

      setCurrentImage(json.url)
      setPrevImages((images) => [...images, json.url])
      reset()
    } catch (error) {
      console.error(error)
      alert("Oops! Something went wrong with that query, let's try again!")
    } finally {
      getQuota()
    }
  }

  const makeQuery = (queryInputs) => {
    const parameters = new URLSearchParams({
      access_key: ACCESS_KEY,
      url: `https://${queryInputs.url}`,
      format: queryInputs.format,
      width: queryInputs.width,
      height: queryInputs.height,
      no_cookie_banners: queryInputs.no_cookie_banners,
      no_ads: queryInputs.no_ads,
      wait_until: 'network_idle',
      response_type: 'json',
      fail_on_status: '400,404,500-511',
    })

    callAPI(`https://api.apiflash.com/v1/urltoimage?${parameters.toString()}`)
  }

  const submitForm = () => {
    if (!inputs.url.trim()) {
      alert('You forgot to submit an url!')
      return
    }

    const updatedInputs = Object.entries(inputs).reduce(
      (values, [key, value]) => ({
        ...values,
        [key]: value || defaultValues[key] || value,
      }),
      {},
    )

    setInputs(updatedInputs)
    makeQuery(updatedInputs)
  }

  return (
    <div className="whole-page">
      {quota ? (
        <p className="quota">
          Remaining API calls: {quota.remaining} out of {quota.limit}
        </p>
      ) : null}
      <h1>Build Your Own Screenshot! 📸</h1>
      <APIForm
        inputs={inputs}
        handleChange={handleChange}
        onSubmit={submitForm}
      />
      {currentImage ? (
        <img
          className="screenshot"
          src={currentImage}
          alt="Screenshot returned"
        />
      ) : null}
      <div className="container">
        <h3>Current Query Status:</h3>
        <p>
          https://api.apiflash.com/v1/urltoimage?access_key=ACCESS_KEY
          <br />
          &amp;url={inputs.url}
          <br />
          &amp;format={inputs.format}
          <br />
          &amp;width={inputs.width}
          <br />
          &amp;height={inputs.height}
          <br />
          &amp;no_cookie_banners={inputs.no_cookie_banners}
          <br />
          &amp;no_ads={inputs.no_ads}
        </p>
      </div>
      <div className="container">
        <Gallery images={prevImages} />
      </div>
      <br />
    </div>
  )
}

export default App

import Layout from '../components/layout'
import styles from './index.module.css'
import { useState } from 'react'
import axios from 'axios'

const apiEndpoint = 'http://localhost/colors-api/index.php/color/';

export async function getStaticProps() {
  const results = await axios.get(`${apiEndpoint}list`);
  return {
    props: {
      colors: results.data
    }
  }
}

function isColorTooLight(color) {
  const hex = color.replace('#', '');
  const c_r = parseInt(hex.substr(0, 2), 16);
  const c_g = parseInt(hex.substr(2, 2), 16);
  const c_b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
  return brightness > 155;
}

export default function Home({ colors }) {
  const [colorValue, setColorValue] = useState('');
  const [error, setError] = useState('');
  const [updatedColorsList, setUpdatedColorsList] = useState(colors);
  const { snackBar, headingMd, headingLg, list, padding1px, listItem} = styles;

  const setErrorMessage  = (message) => {
    setError(message);
    setTimeout(() => {
      setError('')
    }, 3000)
  }

  const addColor = async () => {
    try {
      const {data} = await axios.post(`${apiEndpoint}create`, {name: colorValue, value:colorValue})
      setUpdatedColorsList((state) => [...state, {hex_value: data }]);
    } catch (e) {
      setErrorMessage(`${JSON.stringify(e.message)}`);
    }
  }

  const deleteColor = async (value) => {
    try {
      await axios.delete(`${apiEndpoint}delete`, {data: {value}})
      setUpdatedColorsList((state) => state.filter(({hex_value}) => hex_value !== value ));
    } catch (e) {
      setErrorMessage(`${JSON.stringify(e.message)}`);
    }
  }

  return (
    <Layout>
      {error && (<div className={snackBar}>{error}</div>)}
      <section className={`${headingMd} ${padding1px}`}>
        <h2 className={headingLg}>Colors</h2>
        <ul className={list}>
          {updatedColorsList.map(({hex_value}) => (
            <li className={listItem} key={hex_value}>
              <div style={{backgroundColor: hex_value, border: '1px solid black', borderRadius: '5px', color: isColorTooLight(hex_value) ? 'black' : 'white'}}>{hex_value}</div>
              <a onClick={() => deleteColor(hex_value)}><div>x</div></a>
            </li>
          ))}
        </ul>
        <input value={colorValue}  readOnly/>
        <input value={colorValue}type="color" onChange={(event) => setColorValue(event.currentTarget.value)} placeholder='Insert new color hex value' />
        <button onClick={addColor}>Add Color</button>
      </section>
    </Layout>
  )
}
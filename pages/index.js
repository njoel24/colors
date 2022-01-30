import Layout from '../components/layout'
import styles from './index.module.css'
import { useEffect, useState } from 'react'
import AWS from 'aws-sdk'

const tableName = 'Colors';
const params = {
  TableName: tableName
};
AWS.config.update({
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-east-1',
});
const client = new AWS.DynamoDB.DocumentClient();

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
  const [updatedColorsList, setUpdatedColorsList] = useState([]);
  const { snackBar, headingMd, headingLg, list, padding1px, listItem} = styles;

  const setErrorMessage  = (message) => {
    setError(message);
    setTimeout(() => {
      setError('')
    }, 3000)
  }

  useEffect(() => {
    client.scan(params, (err, data) => {
      const items = data.Items.map((item) => ({name: item['Name'], hex_value: item['Value']}));
      setUpdatedColorsList(items);
    }) 
  }, []) 

  const addColor = async () => {
    try {
      const params = {
        TableName: tableName,
        Item: {
            // name property passed from body
            "color_": colorValue,
            "Name": colorValue,
            "Value": colorValue
        }
      };
      client.put(params, (err, data) => {
        if (err) {
            console.error("Unable to add item.");
            console.error("Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            setUpdatedColorsList((state) => [...state, {hex_value: colorValue }]);
        }
      });
    } catch (e) {
      setErrorMessage(`${JSON.stringify(e.message)}`);
    }
  }

  const deleteColor = async (value) => {
    try {
      const params = {
        TableName: tableName,
        Key: {
          // name property passed from body
          "color_": value
      }
      };
      client.delete(params, (err, data) => {
        if (err) {
            console.error("Unable to delete item.");
            console.error("Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Delete item:", JSON.stringify(data, null, 2));
            setUpdatedColorsList((state) => state.filter(({hex_value}) => hex_value !== value ));
        }
      });
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
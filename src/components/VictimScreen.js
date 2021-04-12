/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Button,
  Typography,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Tooltip,
  List,
  message,
} from 'antd';
import { PushpinOutlined } from '@ant-design/icons';
import { createUseStyles } from 'react-jss';

import hospital from '../assets/hospital.jpeg';
import {
  getIllness,
  searchHospital,
  createBooking,
} from '../services';

const useStyles = createUseStyles({
  img: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
  rightPanel: {
    padding: 32,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  submitBtn: {
    marginTop: 40,
  },
});

const steps = [
  {
    title: 'Person Details',
    description: 'Fill in your personal details',
  },
  {
    title: 'Select a Hospital',
    description: 'Our suggested hospitals based your severity level',
  },
  {
    title: 'Completed',
    description: '',
  },
];

/**
 * Format duration in HH hr mm mins.
 * 
 * @param {int} totalMinutes - Duration in minutes.
 * @returns {String} - Formated hour and mintues.
 */
const formatDuration = (totalMinutes) => {
  const duration = parseInt(totalMinutes);
  const HH = Math.floor(duration / 60);
  const mm = duration % 60;
  if (HH === 0 && mm === 0) {
    return 'Immediate';
  } else if (HH === 0) {
    return mm +  ' mins';
  } else if (mm === 0) {
    return HH +  ' hr ';
  } else if (HH !== 0 && mm !== 0) {
    return HH +  ' hr ' + mm +  ' mins';
  }
}

const VictimScreen = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [illnesses, setIllnesses] = useState([]);
  const [current, setCurrent] = useState(0);
  const [details, setDetials] = useState({});
  const [hospitals, setHospitals] = useState([]);
  const [result, setResult] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    getIllness()
      .then(res => {
        setIllnesses(res.data?._embedded?.illnesses);
      })
      .catch(err => {
        console.warn(err);
      })
  }, [])

  // User submit personal details.
  const onFinish = (values) => {
    console.log(values);
    setDetials(values);
    setCurrent(1);

    // Start searching for hospitals.
    setLoading(true);
    searchHospital(values.severity)
      .then(res => {
        setLoading(false);
        setHospitals(res.data.hospitals);
      })
      .catch(err => {
        setLoading(false);
        message.error('Failed to find the hospitals');
      })
  }

  // User select hospitals to queue.
  const onBook = (item) => {
    const bookingDetails = { ...details, hospital: item, createdAt: Date.now() };
    console.log(bookingDetails);

    setLoading(true);
    createBooking(bookingDetails)
      .then((res) => {
        setLoading(false);
        setCurrent(2);
        setResult({ ...bookingDetails, docRef: res.data.docRef });
      })
      .catch((error) => {
        setLoading(false);
        message.error('Failed to create a booking');
      });
  }

  const renderContent = () => {
    if (current === 0) {
      return (
        <Form
          layout='vertical'
          name="control-hooks"
          form={form}
          onFinish={onFinish}
          size='large'
        >
          <Row gutter={12}>
            <Col md={12}>
              <Form.Item rules={[{ required: true }]} label="First Name" name="firstname">
                <Input placeholder="John" />
              </Form.Item>
            </Col>
            <Col md={12}>
              <Form.Item rules={[{ required: true }]} label="Last Name" name="lastname">
                <Input placeholder="Wall" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col md={6}>
              <Form.Item rules={[{ required: true }]} label="Gender" name="gender">
                <Select placeholder="Male">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={18}>
              <Form.Item rules={[{ required: true }]} label="Illness / Condition" name="illness">
                <Select placeholder="Select your illness here">
                  {
                    illnesses.map((item, index) => {

                      return (
                        <Select.Option key={index} value={item?.illness?.name}>{item?.illness?.name}</Select.Option>
                      )
                    })
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item rules={[{ required: true }]} label="Severity Level" name="severity">
            <Space>
              <Radio.Group>
                <Radio.Button value="0">0</Radio.Button>
                <Radio.Button value="1">1</Radio.Button>
                <Radio.Button value="2">2</Radio.Button>
                <Radio.Button value="3">3</Radio.Button>
                <Radio.Button value="4">4</Radio.Button>
              </Radio.Group>
              <Tooltip title="0 means you have no pain, 2 means mild pain, 4 is severe pain">
                <Typography.Link href="#">Need Help?</Typography.Link>
              </Tooltip>
            </Space>
          </Form.Item>
          
          <Form.Item className={classes.submitBtn}>
            <Button type="primary" htmlType="submit">Find a Hospital</Button>
          </Form.Item>
        </Form>
      );
    }

    if (current === 1) {
      return (
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={hospitals}
          renderItem={item => {
            const totalWait = formatDuration(item.waitingTime);
            const lat = item.location.lat;
            const lng = item.location.lng;
            return (
              <List.Item actions={[<a key="list-select" onClick={() => onBook(item)}>Book</a>]}>
                <List.Item.Meta
                  avatar={
                  <Space direction="vertical" style={{ width: 90 }}>
                    <Typography.Text strong>Wait Time</Typography.Text>
                    <Typography.Text type={totalWait.includes('hr') ? 'danger' : 'success'} strong>{totalWait}</Typography.Text>
                  </Space>}
                  title={<a href={`https://maps.google.com/?q=${lat},${lng}`} target="_blank" rel="noreferrer"><PushpinOutlined /> {item.name}</a>}
                  description={`There are ${item.patientCount} patients infront of you. The average process time of this hospital is ${formatDuration(item.averageProcessTime)}.`}
                />
              </List.Item>
            )
          }}
          pagination={{
            onChange: page => {
              // console.log(page);
            },
            pageSize: 6,
          }}
        />
      )
    }
    
    const selectedHospital = result?.hospital || {};
    const time = formatDuration(selectedHospital.waitingTime);
    return (
      <>
        <Typography.Title level={4}>Thank you for booking - {selectedHospital.name} | Booking ID: {result.docRef}</Typography.Title>
        <Space>
          <Typography.Text>Estimated Wait Time: </Typography.Text>
          <Typography.Title type={time.includes('hr') ? 'danger' : 'success'} level={2}>{time}</Typography.Title>
        </Space>
        {
          selectedHospital.patientCount > 0
          &&
          <Typography.Text>
            {selectedHospital.patientCount} patients are in front of you. The average process time of this hospital is {formatDuration(selectedHospital.averageProcessTime)}
          </Typography.Text>
        }
        <Typography.Text>Your severity leve is: {selectedHospital.severity}</Typography.Text>
      </>
    );
  }

  return (
    <Row style={{ flex: 1 }}>
      <Col xs={0} sm={0} md={0} lg={14} xl={14}>
        <img src={hospital} alt="hospital" className={classes.img} />
      </Col>
      <Col xs={24} sm={24} md={24} lg={10} xl={10}>
        <div className={classes.rightPanel}>
          <Typography.Title level={4}>{current + 1} / {steps.length} steps</Typography.Title>
          <Typography.Title>{steps[current].title}</Typography.Title>
          <Typography.Paragraph type="secondary">{steps[current].description}</Typography.Paragraph>

          { renderContent() }
        </div>
      </Col>
    </Row>
  );
};

export default VictimScreen;
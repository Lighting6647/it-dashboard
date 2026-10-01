import React, { Fragment, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LarkForm from './pages/LarkForm';
import Login from './pages/Login';
import UserAccessManager from './pages/UserAccessManager';
import fernAesthetiqueLogo from './assets/fern-aesthetique-logo.png';
import { authFetch, clearAuth, getStoredAuth, ROLE_LABELS } from './auth';
import Chart from 'chart.js/auto';
import gsap from 'gsap';
import * as XLSX from 'xlsx';
import { 
  Ticket, 
  Lightbulb, 
  Edit3, 
  Printer, 
  Database,
  CheckCircle,
  AlertTriangle,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Search,
  Menu,
  Laptop,
  FileCode,
  Bug,
  ShieldCheck,
  Wrench,
  RotateCcw
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
const IOS_DEVICE_MONITOR_BASE = 'https://ios-device-monitor-46w9.onrender.com';
const THAI_MONTH_LABELS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// Initial blank data - use Excel import to load real data
const initialAssetsData = [
  {
    "sn": 23,
    "date": "20/05/2569",
    "user": "อำพล เเซ่เเฮ",
    "position": "IT",
    "itemType": "Computer (Pc)",
    "deviceSerial": "AS-002",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 83,
    "date": "06/12/2568",
    "user": "อำพล    แซ่แฮ",
    "position": "IT",
    "itemType": "Ipad",
    "deviceSerial": "iPad-010",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 217,
    "date": "",
    "user": "อำพล  แซ่แฮ",
    "position": "IT",
    "itemType": "Mornitor",
    "deviceSerial": "LG-005",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 213,
    "date": "18/05/2569",
    "user": "ธันวา เเซ่เเฮ",
    "position": "IT",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-010 ",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 138,
    "date": "20/11/2568",
    "user": "อำพล   แซ่แฮ",
    "position": "IT",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-033",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 239,
    "date": "",
    "user": "อำพล  แซ่แฮ",
    "position": "IT",
    "itemType": "External HDD",
    "deviceSerial": "ETN-003 WD My PassPort 1TB",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 246,
    "date": "",
    "user": "อำพล  แซ่แฮ",
    "position": "IT",
    "itemType": "Cable HDMI",
    "deviceSerial": "ไม่มีหมายเลข อุปกรณ์",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 248,
    "date": "10/07/2569",
    "user": "ธันวา เเซ่เเฮ",
    "position": "IT",
    "itemType": "Mouse",
    "deviceSerial": "MOS-002",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 252,
    "date": "",
    "user": "อำพล  แซ่แฮ",
    "position": "IT",
    "itemType": "Keyboard",
    "deviceSerial": "KBD-003",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 329,
    "date": "10/07/2569",
    "user": "ธันวา เเซ่เเฮ",
    "position": "IT",
    "itemType": "Keyboard",
    "deviceSerial": "KBD-007",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 272,
    "date": "",
    "user": "อำพล   แซ่แฮ",
    "position": "IT",
    "itemType": "Screwdriver",
    "deviceSerial": "ไม่มีหมายเลข อุปกรณ์",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 33,
    "date": "09/07/2569",
    "user": "วิลาสินี ทับทิม (นี)",
    "position": "Accounting",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-006",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ วัน จ"
  },
  {
    "sn": 313,
    "date": "",
    "user": "สุภาพ แสนจันทร์ ( ส้ม )",
    "position": "Accounting",
    "itemType": "Printer",
    "deviceSerial": "PT-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ วัน จ"
  },
  {
    "sn": 135,
    "date": "09/07/2569",
    "user": "วิลาสินี ทับทิม (นี)",
    "position": "Accounting",
    "itemType": "Mornitor",
    "deviceSerial": "LG-004",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ วัน จ"
  },
  {
    "sn": 27,
    "date": "",
    "user": "สุภาพ แสนจันทร์ ( ส้ม )",
    "position": "Accounting",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-005",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ วัน จ"
  },
  {
    "sn": 34,
    "date": "",
    "user": "ณัฐชา คำสอนพันธ์ (กิ๊ก)",
    "position": "Procurement & Warehouse Officer",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-007",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 93,
    "date": "08/05/3111",
    "user": "ศิริพร เพชรมูล ( บี )",
    "position": "Procurement & Warehouse Officer",
    "itemType": "Ipad",
    "deviceSerial": "iPad-020",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 71,
    "date": "08/05/3111",
    "user": "ศิริพร เพชรมูล ( บี )",
    "position": "Procurement & Warehouse Officer",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-011",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 111,
    "date": "08/05/3111",
    "user": "ศิริพร เพชรมูล ( บี )",
    "position": "Procurement & Warehouse Officer",
    "itemType": "Apple Pancill",
    "deviceSerial": "Pencil-018",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 26,
    "date": "",
    "user": "ศิริพร เพชรมูล ( บี )",
    "position": "Procurement & Warehouse Officer",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-004",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 58,
    "date": "",
    "user": "ธนัชชา บุญมีมาก (ป๊อป)",
    "position": "Content Creator",
    "itemType": "Macbook",
    "deviceSerial": "MacBookAir-028",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 325,
    "date": "10/07/2569",
    "user": "วริสรา สงวนวงษ์ (ซินดี้)",
    "position": "Content Creator",
    "itemType": "Macbook",
    "deviceSerial": "MacBook air-029  ",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 339,
    "date": "01/07/2569",
    "user": "ณัฐฏชญาดา ตรีวิวัฒน์กุล (Mac)",
    "position": "Content Creator",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-043",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 231,
    "date": "23/05/2569",
    "user": "ธนัชชา บุญมีมาก (ป๊อป)",
    "position": "Content Creator",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "Fernclinic-MKT-005",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 214,
    "date": "",
    "user": "วริสรา สงวนวงษ์ (ซินดี้)",
    "position": "Tiktok Content Creator",
    "itemType": "Notebook Asus",
    "deviceSerial": "Asus-031",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 265,
    "date": "11/12/2568",
    "user": "นภัสสร นาสวน ( โบว์ )",
    "position": "Tiktok Content Creator",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-037",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 86,
    "date": "",
    "user": "นภัสสร นาสวน ( โบว์ )",
    "position": "Tiktok Content Creator",
    "itemType": "Ipad",
    "deviceSerial": "iPad-013",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 87,
    "date": "18/07/2569",
    "user": "บุษกร บัวสวรรค์",
    "position": "Tiktok Content Creator",
    "itemType": "Ipad",
    "deviceSerial": "iPad-014",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 282,
    "date": "15/07/2569",
    "user": "ปณิศอร บุญจูบุตร",
    "position": "Tiktok Content Creator",
    "itemType": "Ipad",
    "deviceSerial": "iPad-021",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 53,
    "date": "",
    "user": "ทีม",
    "position": "Tiktok Content Creator",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-013",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 62,
    "date": "",
    "user": "ทีม",
    "position": "Tiktok Content Creator",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 66,
    "date": "",
    "user": "ทีม",
    "position": "Tiktok Content Creator",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-006",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 72,
    "date": "",
    "user": "ทีม",
    "position": "Tiktok Content Creator",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-012",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 357,
    "date": "",
    "user": "ทีม",
    "position": "Tiktok Content Creator",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-014",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 365,
    "date": "30/06/2569",
    "user": "ทีม",
    "position": "Tiktok Content Creator",
    "itemType": "IPhone",
    "deviceSerial": "iphone-015",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 20,
    "date": "",
    "user": "นภัสสร นาสวน ( โบว์ )",
    "position": "Tiktok Content Creator",
    "itemType": "IMac",
    "deviceSerial": "MC-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 326,
    "date": "",
    "user": "ชัยธัช ชัยวัฒน์ (มาร์ค)",
    "position": "Graphic Designer",
    "itemType": "Computer (Pc)",
    "deviceSerial": "AS-003",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 305,
    "date": "08/06/2569",
    "user": "รามจิตติ ชินนะเกิดโชค(เบนซ์)",
    "position": "Graphic Designer",
    "itemType": "Computer (Pc), Mornitor",
    "deviceSerial": "PC LG-004 ",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 294,
    "date": "08/06/2569",
    "user": "อาทิตยา มุมทอง (ขมิ้น)",
    "position": "Graphic Designer",
    "itemType": "IMac",
    "deviceSerial": "MC-008",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 319,
    "date": "19/05/2569",
    "user": "พิชชาพร คอทอง(พีเจ้น)",
    "position": "Graphic Designer",
    "itemType": "IMac",
    "deviceSerial": "MC-009",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 218,
    "date": "08/06/2569",
    "user": "อาทิตยา มุมทอง (ขมิ้น)",
    "position": "Graphic Designer",
    "itemType": "Mornitor",
    "deviceSerial": "LG-003 (จอ)",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 303,
    "date": "08/06/2569",
    "user": "รามจิตติ ชินนะเกิดโชค(เบนซ์)",
    "position": "Graphic Designer",
    "itemType": "Mornitor",
    "deviceSerial": "AS-001",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 304,
    "date": "",
    "user": "พิชชาพร คอทอง(พีเจ้น)",
    "position": "Graphic Designer",
    "itemType": "Mornitor",
    "deviceSerial": "AS-003",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 318,
    "date": "",
    "user": "ชัยธัช ชัยวัฒน์ (มาร์ค)",
    "position": "Graphic Designer",
    "itemType": "Mornitor",
    "deviceSerial": "LG-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 234,
    "date": "08/06/2569",
    "user": "อาทิตยา มุมทอง (ขมิ้น)",
    "position": "Graphic Designer",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "Fernclinic-Meeting-001",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 301,
    "date": "",
    "user": "พิชชาพร คอทอง(พีเจ้น)",
    "position": "Graphic Designer",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "Meeting-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 238,
    "date": "08/06/2569",
    "user": "อาทิตยา มุมทอง (ขมิ้น)",
    "position": "Graphic Designer",
    "itemType": "External HDD",
    "deviceSerial": "ETN-002  WD My PassPort 4TB",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 247,
    "date": "",
    "user": "พิชชาพร คอทอง(พีเจ้น)",
    "position": "Graphic Designer",
    "itemType": "Mouse",
    "deviceSerial": "MOS-001",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 249,
    "date": "08/06/2569",
    "user": "อาทิตยา มุมทอง (ขมิ้น)",
    "position": "Graphic Designer",
    "itemType": "Mouse",
    "deviceSerial": "MOS-003",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 250,
    "date": "08/06/2569",
    "user": "อาทิตยา มุมทอง (ขมิ้น)",
    "position": "Graphic Designer",
    "itemType": "Keyboard",
    "deviceSerial": "KBD-004",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 260,
    "date": "01/06/2569",
    "user": "ชัยธัช ชัยวัฒน์ (มาร์ค)",
    "position": "Graphic Designer",
    "itemType": "Keyboard",
    "deviceSerial": "KBD-006",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 302,
    "date": "08/06/2569",
    "user": "รามจิตติ ชินนะเกิดโชค(เบนซ์)",
    "position": "Graphic Designer",
    "itemType": "Hub Lan",
    "deviceSerial": "ไม่มีหมายเลข",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 330,
    "date": "20/05/2569",
    "user": "พิชชาพร คอทอง(พีเจ้น)",
    "position": "Graphic Designer",
    "itemType": "Hub Lan",
    "deviceSerial": "USB-C TO LAN ",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 229,
    "date": "",
    "user": "ทีม admin",
    "position": "Admin",
    "itemType": "Computer (Pc)",
    "deviceSerial": "MIS-002 มินิpc",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 36,
    "date": "",
    "user": "กานต์ฑิตา ธีระพิบูลย์ ( อิง )",
    "position": "Admin",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-011",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 37,
    "date": "",
    "user": "ศุภฤกษ์ ภายใธสง (คริม)",
    "position": "Admin",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-017",
    "status": "ใช้งาน",
    "notes": "หา lark ไม่เจอ ครับ"
  },
  {
    "sn": 76,
    "date": "30/06/2569",
    "user": "ศุภฤกษ์ ภายไธสง (ดรีม)",
    "position": "Admin",
    "itemType": "Ipad",
    "deviceSerial": "iPad-003",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 358,
    "date": "",
    "user": "ทัศววรณ วัลย์ดาว (ใบตอง)",
    "position": "Admin",
    "itemType": "Ipad",
    "deviceSerial": "iPad-019",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 359,
    "date": "",
    "user": "ทัศววรณ วัลย์ดาว (ใบตอง)",
    "position": "Admin",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-004",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 360,
    "date": "",
    "user": "กานต์ฑิตา ธีระพิบูลย์ ( อิง )",
    "position": "Admin",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-009",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 28,
    "date": "",
    "user": "ปัญจมา สมบัติกำไร (เอิน)",
    "position": "Admin",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-014",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 47,
    "date": "",
    "user": "ทัศววรณ วัลย์ดาว (ใบตอง)",
    "position": "Admin",
    "itemType": "Notebook Acer, Iphone",
    "deviceSerial": "ACER-015",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 56,
    "date": "14/07/2569",
    "user": "เนตรปรีญา ทัดศรี",
    "position": "Receptionist",
    "itemType": "Macbook",
    "deviceSerial": "MacBookAir-009",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 91,
    "date": "07/09/3111",
    "user": "Receptionist",
    "position": "Receptionist",
    "itemType": "Ipad",
    "deviceSerial": "iPad-018",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 67,
    "date": "",
    "user": "Receptionist",
    "position": "Receptionist",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-007",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 51,
    "date": "",
    "user": "Receptionist",
    "position": "Receptionist",
    "itemType": "IMac",
    "deviceSerial": "MC-003",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 52,
    "date": "",
    "user": "Receptionist",
    "position": "Receptionist",
    "itemType": "IMac",
    "deviceSerial": "MC-004",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 334,
    "date": "16/07/2569",
    "user": "เนตรปรีญา ทัดศรี",
    "position": "Receptionist",
    "itemType": "Mouse",
    "deviceSerial": "MC-008",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 35,
    "date": "",
    "user": "วิกานดา ทุมมนตรี ( แป๋วแหว๋ว )",
    "position": "Payroll Officer",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-008",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 44,
    "date": "10/07/2569",
    "user": "อนิรุตต์ พานแสนซา",
    "position": "Live Streamer",
    "itemType": "Ipad",
    "deviceSerial": "iPad-016",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 85,
    "date": "26/06/2569",
    "user": "ธนันวลัญชน์ ศรีออน (อาโน)",
    "position": "Live Streamer",
    "itemType": "Ipad",
    "deviceSerial": "iPad-012",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 314,
    "date": "",
    "user": "ชนิสรา ตรีสัตยกุล (อุบอิบ)",
    "position": "Live Streamer",
    "itemType": "Ipad",
    "deviceSerial": "\niPad 017\n",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 61,
    "date": "",
    "user": "ชนิสรา ตรีสัตยกุล  (อุบอิบ)",
    "position": "Live Streamer",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-001",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 63,
    "date": "26/06/2569",
    "user": "ธนันวลัญชน์ ศรีออน (อาโน)",
    "position": "Live Streamer",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-003",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 285,
    "date": "",
    "user": "ชนิสรา ตรีสัตยกุล  (อุบอิบ)",
    "position": "Live Streamer",
    "itemType": "Adapter Apple",
    "deviceSerial": "ADT-007",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 287,
    "date": "",
    "user": "ชนิสรา ตรีสัตยกุล  (อุบอิบ)",
    "position": "Live Streamer",
    "itemType": "Cable Apple",
    "deviceSerial": "-",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 40,
    "date": "",
    "user": "อสมาภรณ์ ย่านเดิม ( เนม )",
    "position": "Personal Assistant to CEO",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-020",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 43,
    "date": "08/01/3111",
    "user": "สรุดตา ป๋อพริ้ง (ปาน)",
    "position": "Personal Assistant to CEO",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-023",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 57,
    "date": "16/07/2569",
    "user": "เนลินญาน์  ศิระไมตรีฉัตร (เนริน)",
    "position": "Personal Assistant to CEO",
    "itemType": "Macbook",
    "deviceSerial": "MacBookAir-027",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 7,
    "date": "",
    "user": "อสมาภรณ์ ย่านเดิม ( เนม )",
    "position": "Personal Assistant to CEO",
    "itemType": "IPhone",
    "deviceSerial": "iPhone-010",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 1,
    "date": "",
    "user": "สุดธิดา เผ่าหอม (ต่าย) (KT)",
    "position": "HR",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 41,
    "date": "",
    "user": "กฤษณา ลำเพ็ง ( พลอย )",
    "position": "HR",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-038",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 42,
    "date": "",
    "user": "นารีรัตน์ ขันทอง ( ออย )",
    "position": "HR",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-022",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 74,
    "date": "",
    "user": "นารีรัตน์ ขันทอง ( ออย )",
    "position": "HR",
    "itemType": "Ipad",
    "deviceSerial": "iPad-001",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 88,
    "date": "10/07/2569",
    "user": "ศรัญญา ธรรมเนียมภักดี ( แนน )",
    "position": "HR",
    "itemType": "Ipad",
    "deviceSerial": "iPad-015",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 320,
    "date": "17/06/2569",
    "user": "นารีรัตน์ ขันทอง ( ออย )",
    "position": "HR",
    "itemType": "Ipad",
    "deviceSerial": "iPad-005",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 48,
    "date": "",
    "user": "ศรัญญา ธรรมเนียมภักดี ( แนน )",
    "position": "HR",
    "itemType": "Notebook HP",
    "deviceSerial": "HP-016",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 49,
    "date": "",
    "user": "ณัฐกานต์ ชิดปรางค์ (เตยหอม)",
    "position": "Photographer",
    "itemType": "IMac",
    "deviceSerial": "MC-001",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 368,
    "date": "",
    "user": "วิจิตราภรณ์ พึ่งจันดุม (พลอย)",
    "position": "Photographer",
    "itemType": "IMac",
    "deviceSerial": "MC-010",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 242,
    "date": "16/07/2569",
    "user": "ณัฐกานต์ ชิดปรางค์ (เตยหอม)",
    "position": "Photographer",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "Fernclinic-MKT-001",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 75,
    "date": "",
    "user": "สรวิชญ์ สิทธิ ( บอม )",
    "position": "Sale",
    "itemType": "Ipad",
    "deviceSerial": "iPad-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 81,
    "date": "",
    "user": "อาทิตย์ สมการ ( เจ้านาย )",
    "position": "Sale",
    "itemType": "Ipad",
    "deviceSerial": "iPad-008",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 82,
    "date": "",
    "user": "สุนทรี บุญนาค ( ตาล )",
    "position": "Sale",
    "itemType": "Ipad",
    "deviceSerial": "iPad-009",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 95,
    "date": "",
    "user": "สุนทรี บุญนาค ( ตาล )",
    "position": "Sale",
    "itemType": "Apple Pancill",
    "deviceSerial": "Pencil-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 100,
    "date": "",
    "user": "สรวิชญ์ สิทธิ ( บอม )",
    "position": "Sale",
    "itemType": "Apple Pancill",
    "deviceSerial": "Pencil-007",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 6,
    "date": "",
    "user": "กฤติน วิชัยดิษฐ (อ้น)crm",
    "position": "CRM Officer",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-019",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 46,
    "date": "",
    "user": "กฤติญา ทาระพันธ์ (แจนนี่) crm",
    "position": "CRM Officer",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-026",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 321,
    "date": "18/05/2569",
    "user": "ชนันพร อินขำ (ไอซ์)crm",
    "position": "CRM Officer",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-003",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 361,
    "date": "",
    "user": "กฤติญา ทาระพันธ์ (แจนนี่) crm",
    "position": "CRM Officer",
    "itemType": "Samsung",
    "deviceSerial": "Samsung Galaxy-001",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 307,
    "date": "27/05/2569",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Computer (Pc)",
    "deviceSerial": "AS-001",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 309,
    "date": "",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Computer (Pc)",
    "deviceSerial": "LG-001",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 311,
    "date": "",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Computer (Pc)",
    "deviceSerial": "MSI-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 350,
    "date": "",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Notebook Asus",
    "deviceSerial": "Asus-024",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 223,
    "date": "",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Mornitor",
    "deviceSerial": "Asus-001",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 243,
    "date": "",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Cable HDMI",
    "deviceSerial": "Fernclinic-IT-003",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 244,
    "date": "",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Cable HDMI",
    "deviceSerial": "Fernclinic-IT-004",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 245,
    "date": "",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Cable HDMI",
    "deviceSerial": "Fernclinic-IT-005",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 251,
    "date": "28/05/2569",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Keyboard",
    "deviceSerial": "KBD-002",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 262,
    "date": "",
    "user": "ปัณณวิชญ์ ทองวัน (บอย)",
    "position": "Data Analysis",
    "itemType": "Keyboard",
    "deviceSerial": "-",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 337,
    "date": "04/06/2569",
    "user": "อภิสิทธิ์ พรจันทราวัฒน์ (จุ้ย)",
    "position": "Video Content Tiktok",
    "itemType": "IMac",
    "deviceSerial": "MC-005",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 310,
    "date": "",
    "user": "พงศกร ผ่องใส (ปอน)",
    "position": "Live Producer",
    "itemType": "Computer (Pc)",
    "deviceSerial": "LG-002",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 266,
    "date": "09/06/2569",
    "user": "พิสิษฐ์ มงคลสมบัติศิริ (เจมส์)",
    "position": "Live Producer",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-021",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 280,
    "date": "",
    "user": "พงศกร ผ่องใส (ปอน)",
    "position": "Live Producer",
    "itemType": "Mornitor",
    "deviceSerial": "MSI-001",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 367,
    "date": "",
    "user": "นายพงศกร ผ่องใส",
    "position": "Live Producer",
    "itemType": "Mornitor",
    "deviceSerial": "LG-006",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 30,
    "date": "01/06/2569",
    "user": "เย็นฤดี มาระวัง (ฝ้าย)",
    "position": "Live Producer",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-013",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 31,
    "date": "05/05/2569",
    "user": "พงศกร ผ่องใส (ปอน)",
    "position": "Live Producer",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-039",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 343,
    "date": "",
    "user": "ทีม live Producer",
    "position": "Live Producer",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "usb-a to c",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 240,
    "date": "",
    "user": "พงศกร ผ่องใส (ปอน)",
    "position": "Live Producer",
    "itemType": "Capture Card",
    "deviceSerial": "VCS-LIVE-0001",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 253,
    "date": "",
    "user": "พงศกร ผ่องใส (ปอน)",
    "position": "Live Producer",
    "itemType": "Cable HDMI",
    "deviceSerial": "Fernclinic-IT-007",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 342,
    "date": "",
    "user": "ทีม live Producer",
    "position": "Live Producer",
    "itemType": "Cable HDMI",
    "deviceSerial": "hdmi Canon",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 315,
    "date": "",
    "user": "พงศกร ผ่องใส (ปอน)",
    "position": "Live Producer",
    "itemType": "Reez Live",
    "deviceSerial": "ไม่มีหมายเลข อุปกรณ์",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 344,
    "date": "",
    "user": "ทีม live Producer",
    "position": "Live Producer",
    "itemType": "อุปกรณ์เสริม/อื่นๆ",
    "deviceSerial": "สาย aux branding",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 345,
    "date": "",
    "user": "ทีม live Producer",
    "position": "Live Producer",
    "itemType": "อุปกรณ์เสริม/อื่นๆ",
    "deviceSerial": "hdmi ต่อจอมอนิเตอร์ไลฟ์",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 346,
    "date": "",
    "user": "ทีม live Producer",
    "position": "Live Producer",
    "itemType": "อุปกรณ์เสริม/อื่นๆ",
    "deviceSerial": "hdmi it-002",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 347,
    "date": "",
    "user": "ทีม live Producer",
    "position": "Live Producer",
    "itemType": "อุปกรณ์เสริม/อื่นๆ",
    "deviceSerial": "adc-006",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 348,
    "date": "",
    "user": "ทีม live Producer",
    "position": "Live Producer",
    "itemType": "อุปกรณ์เสริม/อื่นๆ",
    "deviceSerial": "ไมค์ล่อย dji-branding",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 349,
    "date": "",
    "user": "ทีม live Producer",
    "position": "Live Producer",
    "itemType": "อุปกรณ์เสริม/อื่นๆ",
    "deviceSerial": "ไมค์ล่อย dji-mkt",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 235,
    "date": "",
    "user": "ห้องประชุม บ้าน 18 ชั้น 4",
    "position": "Meeting Room",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "Fernclinic-MKT-004",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 54,
    "date": "",
    "user": "อภิญญา ศรีตะวัน ( บอสต้น )",
    "position": "Boss",
    "itemType": "IMac",
    "deviceSerial": "MC-006",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 55,
    "date": "",
    "user": "อภิญญา ศรีตะวัน ( บอสต้น )",
    "position": "Boss",
    "itemType": "IMac",
    "deviceSerial": "MC-007",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 232,
    "date": "",
    "user": "อภิญญา ศรีตะวัน ( บอสต้น )",
    "position": "Boss",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "Fernclinic-ฺBoss-001",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 241,
    "date": "",
    "user": "อภิญญา ศรีตะวัน ( บอสต้น )",
    "position": "Boss",
    "itemType": "Cable HDMI",
    "deviceSerial": "Fernclinic-IT-001",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 233,
    "date": "",
    "user": "ห้อง Studio บ้าน 18 ชั้น 1",
    "position": "Studio",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "Fernclinic-Studio-001",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 277,
    "date": "26/12/2568",
    "user": "นนท์สิรี ปลื้มทรัพย์ (ใบพลู)",
    "position": "Data Entry",
    "itemType": "Notebook Asus",
    "deviceSerial": "Asus-041",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 29,
    "date": "",
    "user": "ปภาวี จันทร์ขวาง (ครีม)",
    "position": "Data Entry",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-012",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 125,
    "date": "16/06/2569",
    "user": "อารยา ธนพันธุ์พาณิชย์ (หนุงหนิง)",
    "position": "Sale Manager",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-032",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 363,
    "date": "19/01/2569",
    "user": "ณัฐณิชา ศรีวรอรรถิกุล (ใบตอง)",
    "position": "KOL & Event Marketing",
    "itemType": "Iphone",
    "deviceSerial": "IPhone -005",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 283,
    "date": "19/01/2569",
    "user": "ณัฐณิชา ศรีวรอรรถิกุล (ใบตอง)",
    "position": "KOL & Event Marketing",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "Lenovo-001",
    "status": "ใช้งาน",
    "notes": "รอตรวจสอบ"
  },
  {
    "sn": 45,
    "date": "",
    "user": "พัทธนันท์ นาเดียร์  (นาเดียร์ )",
    "position": "OR",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-025",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 60,
    "date": "",
    "user": "หมอฟาง",
    "position": "CEO",
    "itemType": "Macbook",
    "deviceSerial": "MacBookAir-030",
    "status": "ใช้งาน",
    "notes": "     "
  },
  {
    "sn": 215,
    "date": "",
    "user": "หมอฟาง",
    "position": "CEO",
    "itemType": "Macbook",
    "deviceSerial": "MAcbook Pro-034",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 269,
    "date": "",
    "user": "หมอฟาง",
    "position": "CEO",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "Fernclinic-MKT-005",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 236,
    "date": "",
    "user": "Connection Nas",
    "position": "Center Storage",
    "itemType": "External HDD",
    "deviceSerial": "Segate Station 10 TB",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 237,
    "date": "",
    "user": "Connection Nas",
    "position": "Center Storage",
    "itemType": "External HDD",
    "deviceSerial": "ETN-001  WD My Book 4TB",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 254,
    "date": "",
    "user": "Connection TV",
    "position": "TV Center",
    "itemType": "Cable HDMI",
    "deviceSerial": "Fernclinic-IT-006",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 271,
    "date": "",
    "user": "Connection TV",
    "position": "TV Center",
    "itemType": "Cable HDMI",
    "deviceSerial": "Fernclinic-IT-008",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 291,
    "date": "",
    "user": "Connection TV",
    "position": "TV Center",
    "itemType": "Cable HDMI",
    "deviceSerial": "Fernclinic-IT-009",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 292,
    "date": "",
    "user": "Connection TV",
    "position": "TV Center",
    "itemType": "Cable HDMI",
    "deviceSerial": "Fernclinic-IT-010",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 340,
    "date": "06/07/2569",
    "user": "นายสุทธิรงค์ เครือไพบูลย์กุล ( เบนซ์ )",
    "position": "Senior Digital Marketing",
    "itemType": "Notebook Lenovo",
    "deviceSerial": "LENOVO-042",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 369,
    "date": "10/07/2569",
    "user": "สุรวิชญ์ โพธิ์ตาก (ไมค์เมโลดี้)",
    "position": "Operation Department",
    "itemType": "Macbook",
    "deviceSerial": "Macbook-044",
    "status": "ใช้งาน",
    "notes": ""
  },
  {
    "sn": 308,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Computer (Pc)",
    "deviceSerial": "LG-003",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 264,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-036",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 316,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Notebook Asus",
    "deviceSerial": "ASUS-018",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 328,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Macbook",
    "deviceSerial": "MacBook air-035",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 50,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Ipad",
    "deviceSerial": "iPad-004",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 80,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Ipad",
    "deviceSerial": "iPad-007",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 84,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Ipad",
    "deviceSerial": "iPad-011",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 131,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Ipad",
    "deviceSerial": "iPad-006",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 117,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Printer",
    "deviceSerial": "PT-001",
    "status": "รอซ่อม",
    "notes": ""
  },
  {
    "sn": 230,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Hub USB-TypeC",
    "deviceSerial": "Fernclinic-MKT-003",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 335,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Mouse",
    "deviceSerial": "MC-009",
    "status": "ว่าง",
    "notes": ""
  },
  {
    "sn": 261,
    "date": "",
    "user": "ส่วนกลาง/ไม่ระบุ",
    "position": "-",
    "itemType": "Keyboard",
    "deviceSerial": "KBD-001",
    "status": "ว่าง",
    "notes": ""
  }
];

const initialDashboardData = {
  '2026-07': {
    monthName: 'กรกฎาคม 2569',
    totalAssets: 0,
    assetValue: 0,
    assetsExpiring: 0,
    assetsBroken: 0,
    assetsLost: 0,
    assetsVacant: 0,
    ticketsCount: 0,
    slaPercent: 0,
    responseTime: 0,
    resolutionTime: 0,
    csat: 0,
    totalSoftware: 0,
    licensesInUse: 0,
    licensesVacant: 0,
    softwareCost: 0,
    softwareAnnualCost: 0,
    softwareExpiring: 0,
    backupSuccess: 0,
    securityIncidents: 0,
    antivirusCoverage: 0,
    mfaCoverage: 0,
    repairCount: 0,
    repairCost: 0,
    topBrokenDevices: [],
    deptCosts: {},
    softwareExpiringDetails: [],
    assetsExpiringDetails: [],
    ongoingProjects: [],
    vendorContracts: [],
    recommendations: [],
    ticketsList: []
  }
};;









const AssetTags = ({ value, empty = '-' }) => {
  const tags = String(value || '').split(/[,\n]+/).map((item) => item.trim()).filter(Boolean);
  if (tags.length === 0) return empty;
  return (
    <div className="asset-tags">
      {tags.map((tag, index) => {
        const colorIndex = [...tag].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
        return <span key={`${tag}-${index}`} className={`asset-tag asset-tag-${colorIndex}`}>{tag}</span>;
      })}
    </div>
  );
};

const AssetTagEditor = ({ value, onChange, single = false, placeholder = 'พิมพ์ Tag แล้วกด Enter' }) => {
  const [draft, setDraft] = useState('');
  const tags = String(value || '').split(/[,\n]+/).map((item) => item.trim()).filter(Boolean);

  const addDraft = () => {
    const nextTag = draft.trim();
    if (!nextTag) return;
    onChange((single ? [nextTag] : [...new Set([...tags, nextTag])]).join(', '));
    setDraft('');
  };

  return (
    <div className="asset-tag-editor">
      <div className="asset-tag-editor-tags">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className={`asset-tag asset-tag-${[...tag].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6}`}>
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((_, tagIndex) => tagIndex !== index).join(', '))} aria-label={`ลบ Tag ${tag}`}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addDraft();
          }
        }}
        onBlur={addDraft}
        placeholder={tags.length ? 'เพิ่ม Tag...' : placeholder}
      />
    </div>
  );
};

const AssetTagPicker = ({ value, onChange, options, single = false, onClose }) => {
  const selected = String(value || '').split(/[,\n]+/).map((item) => item.trim()).filter(Boolean);
  const toggleOption = (option) => {
    if (single) {
      onChange(option);
      return;
    }
    onChange((selected.includes(option) ? selected.filter((tag) => tag !== option) : [...selected, option]).join(', '));
  };

  return (
    <div className="asset-tag-picker" onClick={(event) => event.stopPropagation()}>
      <div className="asset-tag-picker-title">เลือก Tag ที่มีอยู่</div>
      <div className="asset-tag-picker-options">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            className={selected.includes(option) ? 'selected' : ''}
            onClick={() => toggleOption(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="asset-tag-picker-title">หรือเพิ่ม Tag ใหม่</div>
      <AssetTagEditor value={value} onChange={onChange} single={single} />
      <div className="asset-tag-picker-footer">
        <span>กดบันทึกด้านบนเพื่อยืนยัน</span>
        <button type="button" onClick={onClose}>เสร็จสิ้น</button>
      </div>
    </div>
  );
};

const isValidDashboardData = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const monthKeys = Object.keys(value);
  return monthKeys.length > 0 && monthKeys.every((key) => /^\d{4}-\d{2}$/.test(key) && value[key] && typeof value[key] === 'object');
};

// Some legacy uploads were decoded as Windows-874 even though the workbook
// contained UTF-8 Thai text. Repair only strings that have the characteristic
// mojibake pattern and that round-trip to valid UTF-8; ordinary Thai is kept as-is.
let windows874ByteLookup;
const getWindows874ByteLookup = () => {
  if (windows874ByteLookup) return windows874ByteLookup;
  const decoder = new TextDecoder('windows-874');
  windows874ByteLookup = new Map();
  for (let byte = 0; byte <= 255; byte += 1) {
    windows874ByteLookup.set(decoder.decode(Uint8Array.of(byte)), byte);
  }
  return windows874ByteLookup;
};

const thaiMojibakeScore = (text) => {
  const value = String(text || '');
  const controlCount = (value.match(/[\u0080-\u009f]/g) || []).length;
  const thaiUtf8PrefixCount = (value.match(/\u0e18\u0e30|\u0e40\u0e19/g) || []).length;
  return (controlCount * 4) + thaiUtf8PrefixCount;
};

const repairThaiMojibake = (value) => {
  if (typeof value !== 'string' || thaiMojibakeScore(value) < 2) return value;
  try {
    const byteLookup = getWindows874ByteLookup();
    const bytes = [];
    for (const character of value) {
      const byte = byteLookup.get(character);
      if (byte === undefined) return value;
      bytes.push(byte);
    }
    const repaired = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
    if (!/[\u0e00-\u0e7f]/.test(repaired)) return value;
    return thaiMojibakeScore(repaired) < thaiMojibakeScore(value)
      ? repaired.normalize('NFC')
      : value;
  } catch {
    return value;
  }
};

const repairThaiTextDeep = (value) => {
  if (typeof value === 'string') return repairThaiMojibake(value);
  if (Array.isArray(value)) return value.map(repairThaiTextDeep);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairThaiTextDeep(item)]));
};

const normalizeAssetStatus = (value) => {
  const status = String(value || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  if (!status) return 'ใช้งาน';
  if (['พร้อมใช้', 'พร้อมใช้งาน', 'ว่าง/พร้อมใช้'].includes(status)) return 'ว่าง';
  if (['เสีย', 'รอซ่อมแซม'].includes(status)) return 'รอซ่อม';
  return status;
};

const THAI_KEYBOARD_TO_ENGLISH = {
  'ๆ': 'q', 'ไ': 'w', 'ำ': 'e', 'พ': 'r', 'ะ': 't', 'ั': 'y', 'ี': 'u', 'ร': 'i', 'น': 'o', 'ย': 'p',
  'ฟ': 'a', 'ห': 's', 'ก': 'd', 'ด': 'f', 'เ': 'g', '้': 'h', '่': 'j', 'า': 'k', 'ส': 'l',
  'ผ': 'z', 'ป': 'x', 'แ': 'c', 'อ': 'v', 'ิ': 'b', 'ื': 'n', 'ท': 'm',
};

const normalizeAssetLookup = (value, convertThaiKeyboard = false) => {
  let text = String(value || '').normalize('NFKC').trim().toLowerCase();
  if (convertThaiKeyboard) {
    text = Array.from(text, (character) => THAI_KEYBOARD_TO_ENGLISH[character] || character).join('');
  }
  return text.replace(/\s+/g, '');
};

function Dashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'admin';
  const canRequestService = isAdmin;
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('it_dashboard_data');
    if (!saved) return initialDashboardData;
    try {
      const parsed = JSON.parse(saved);
      return isValidDashboardData(parsed) ? repairThaiTextDeep(parsed) : initialDashboardData;
    } catch {
      return initialDashboardData;
    }
  });
  const [assetsList, setAssetsList] = useState(() => {
    const saved = localStorage.getItem('it_dashboard_assets');
    return saved ? repairThaiTextDeep(JSON.parse(saved)) : initialAssetsData;
  });
  const [assetSearch, setAssetSearch] = useState('');
  const [assetDeptFilter, setAssetDeptFilter] = useState('');
  const [assetStatusFilter, setAssetStatusFilter] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState('');
  const [assetRequests, setAssetRequests] = useState([]);
  const [assetRequestLoading, setAssetRequestLoading] = useState(false);
  const [assetRequestForm, setAssetRequestForm] = useState({ requester: '', department: '', itemType: '', purpose: '', requestedDate: new Date().toISOString().slice(0, 10), notes: '', workflowType: '' });
  const [assetWorkflowRole, setAssetWorkflowRole] = useState('requester');
  const [assetRequesterSearch, setAssetRequesterSearch] = useState('');
  const [assetReturnSearch, setAssetReturnSearch] = useState('');
  const [assetReturnIdentity, setAssetReturnIdentity] = useState('');
  const [assetReturnView, setAssetReturnView] = useState('returns');
  const [operationsLogView, setOperationsLogView] = useState('checklist');
  const notificationInitializedRef = useRef(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const keys = Object.keys(data || {}).sort((a, b) => b.localeCompare(a));
    return keys.length > 0 ? keys[0] : "2026-07";
  });
  const [activeModal, setActiveModal] = useState(null); // 'edit', 'expiringAssets', 'expiringSoftware', 'topBrokenDevices', 'assetsList', 'fullConsole'
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: string }
  
  // Console tab, month selectors, and editing state trackers
  const [consoleTab, setConsoleTab] = useState('months');
  const [consoleMonth, setConsoleMonth] = useState('2026-07');
  const [consoleSaving, setConsoleSaving] = useState(false);
  const [consoleSaveMessage, setConsoleSaveMessage] = useState('');
  const [consoleAssetSearch, setConsoleAssetSearch] = useState('');
  const [editingAssetTagField, setEditingAssetTagField] = useState(null);
  const [editingAssetSn, setEditingAssetSn] = useState(null);
  const [editingTicketSn, setEditingTicketSn] = useState(null);
  const [editingSoftwareIndex, setEditingSoftwareIndex] = useState(null);
  const [softwareName, setSoftwareName] = useState('');
  const [softwareUsed, setSoftwareUsed] = useState('0');
  const [softwareVacant, setSoftwareVacant] = useState('0');
  const [softwareExpiryDate, setSoftwareExpiryDate] = useState('');
  const [softwareMonthlyCost, setSoftwareMonthlyCost] = useState('0');
  const [softwareOwner, setSoftwareOwner] = useState('');
  const [softwarePaymentChannel, setSoftwarePaymentChannel] = useState('');
  const [softwarePaymentDate, setSoftwarePaymentDate] = useState('');
  const [softwareRegisteredEmail, setSoftwareRegisteredEmail] = useState('');
  const [softwareCurrentUsers, setSoftwareCurrentUsers] = useState('');
  const [softwareSearch, setSoftwareSearch] = useState('');
  const [softwareBillingFilter, setSoftwareBillingFilter] = useState('all');
  const [softwareFormExpanded, setSoftwareFormExpanded] = useState(false);
  const softwareExcelInputRef = useRef(null);
  const emptyVendorContract = { vendor: '', service: '', contractNo: '', startDate: '', endDate: '', billingCycle: 'รายเดือน', amount: '0', contact: '', status: 'ใช้งาน', notes: '' };
  const [vendorContractForm, setVendorContractForm] = useState(emptyVendorContract);
  const [editingVendorContractIndex, setEditingVendorContractIndex] = useState(null);
  const emptyProjectForm = { title: '', desc: '', projectType: 'ระบบงาน', owner: '', status: 'กำลังดำเนินการ', progress: '0', hoursSaved: '0', startDate: '', targetDate: '' };
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);

  // Lark Form states
  const [larkFormType, setLarkFormType] = useState('ticket'); // 'ticket' | 'asset'
  const [larkTicketComplainant, setLarkTicketComplainant] = useState('');
  const [larkTicketEmail, setLarkTicketEmail] = useState('');
  const [larkTicketAnydesk, setLarkTicketAnydesk] = useState('');
  const [larkTicketAssetSerial, setLarkTicketAssetSerial] = useState('');
  const [larkTicketIssue, setLarkTicketIssue] = useState('');
  const [larkTicketCause, setLarkTicketCause] = useState('');
  const [larkTicketDuration, setLarkTicketDuration] = useState('00:30');
  const [larkTicketResponder, setLarkTicketResponder] = useState('');
  const [larkTicketStatus, setLarkTicketStatus] = useState('เสร็จสิ้น');
  const [larkTicketCost, setLarkTicketCost] = useState('0');

  const [larkAssetUser, setLarkAssetUser] = useState('');
  const [larkAssetPosition, setLarkAssetPosition] = useState('');
  const [larkAssetItemType, setLarkAssetItemType] = useState('');
  const [larkAssetSerial, setLarkAssetSerial] = useState('');
  const [larkAssetStatus, setLarkAssetStatus] = useState('ใช้งาน');
  const [larkAssetNotes, setLarkAssetNotes] = useState('');

  const [larkSubmitted, setLarkSubmitted] = useState(false);
  const [larkTicketRole, setLarkTicketRole] = useState('user'); // 'user' | 'it'
  const [selectedPendingTicketSn, setSelectedPendingTicketSn] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState({
    mgmt: false,
    excel: false,
    export: false
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [externalDevices, setExternalDevices] = useState([]);
  const [isFetchingDevices, setIsFetchingDevices] = useState(false);
  const [externalDevicesLastSynced, setExternalDevicesLastSynced] = useState(null);
  const [externalDevicesSyncError, setExternalDevicesSyncError] = useState('');
  const [externalDevicesRefreshKey, setExternalDevicesRefreshKey] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;
    const context = gsap.context(() => {
      const compactNavigation = window.matchMedia('(max-width: 1100px)').matches;
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (!compactNavigation) {
        timeline.fromTo('.sidebar', { opacity: 0, x: -34 }, { opacity: 1, x: 0, duration: 0.72, clearProps: 'transform' });
      } else {
        gsap.set('.sidebar', { clearProps: 'all' });
      }
      timeline
        .fromTo('.dashboard-header', { opacity: 0, y: -22 }, { opacity: 1, y: 0, duration: 0.58 }, compactNavigation ? 0 : '-=0.4')
        .fromTo('.dashboard-grid > .card', { opacity: 0, y: 30, scale: 0.975 }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.62,
          stagger: 0.07
        }, '-=0.32')
        .fromTo('.recommendation-card', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.25');
    });
    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!activeModal || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const frame = window.requestAnimationFrame(() => {
      gsap.fromTo('.modal-overlay.active .modal, .modal-overlay.active .lark-form-container', {
        opacity: 0,
        y: 24,
        scale: 0.975
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.48,
        ease: 'power3.out',
        clearProps: 'transform'
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeModal]);

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;
    document.body.classList.add('mobile-menu-open');
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('mobile-menu-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (activeModal) setMobileSidebarOpen(false);
  }, [activeModal]);

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 1100px)').matches
    ) return undefined;
    const frame = window.requestAnimationFrame(() => {
      gsap.fromTo('.sidebar .control-group .sidebar-btn', { opacity: 0, y: -8 }, {
        opacity: 1,
        y: 0,
        duration: 0.32,
        stagger: 0.035,
        ease: 'power2.out',
        clearProps: 'transform'
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [sidebarExpanded]);

  useEffect(() => {
    let cancelled = false;
    let activeController = null;

    const fetchDevices = async () => {
      if (activeController) return;
      activeController = new AbortController();
      setIsFetchingDevices(true);
      try {
        const response = await fetch(`${IOS_DEVICE_MONITOR_BASE}/api/devices`, {
          cache: 'no-store',
          signal: activeController.signal
        });
        if (!response.ok) throw new Error(`Device Monitor API ${response.status}`);
        const result = await response.json();
        if (!cancelled && Array.isArray(result?.devices)) {
          setExternalDevices(result.devices);
          setExternalDevicesLastSynced(new Date());
          setExternalDevicesSyncError('');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching external devices:', error);
          if (!cancelled) setExternalDevicesSyncError('ซิงค์ไม่สำเร็จ');
        }
      } finally {
        activeController = null;
        if (!cancelled) setIsFetchingDevices(false);
      }
    };

    const syncWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchDevices();
    };

    fetchDevices();
    const interval = window.setInterval(fetchDevices, 30 * 1000);
    window.addEventListener('focus', fetchDevices);
    document.addEventListener('visibilitychange', syncWhenVisible);
    return () => {
      cancelled = true;
      if (activeController) activeController.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', fetchDevices);
      document.removeEventListener('visibilitychange', syncWhenVisible);
    };
  }, [externalDevicesRefreshKey]);
  useEffect(() => {
    if (!activeModal) return undefined;
    setMobileSidebarOpen(false);
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [activeModal]);

  const requireAdminAccess = (openMenu) => {
    if (!isAdmin) {
      alert('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแล IT');
      return;
    }
    openMenu();
  };

  const loadAssetRequests = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE}/api/asset-requests`);
      if (!response.ok) throw new Error(`API ${response.status}`);
      setAssetRequests(repairThaiTextDeep(await response.json()));
    } catch (err) {
      console.error('Failed to load asset requests:', err);
    }
  }, []);

  const refreshOperationalStateFromDb = async () => {
    const response = await authFetch(`${API_BASE}/api/db-state`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`API ${response.status}`);
    const result = await response.json();
    isPollingUpdateRef.current = true;
    if (result.data) setData(repairThaiTextDeep(result.data));
    if (result.assetsList) setAssetsList(repairThaiTextDeep(result.assetsList));
  };

  const submitAssetRequest = async (event) => {
    event.preventDefault();
    setAssetRequestLoading(true);
    try {
      const response = await authFetch(`${API_BASE}/api/asset-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetRequestForm)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'ส่งคำขอไม่สำเร็จ');
      setAssetRequestForm({ requester: '', department: '', itemType: '', purpose: '', requestedDate: new Date().toISOString().slice(0, 10), notes: '', workflowType: '' });
      await loadAssetRequests();
      alert(result.count > 1
        ? `ส่งคำขอเบิก ${result.count} เครื่องสำเร็จ เลขที่ #${result.ids.join(', #')}`
        : `ส่งคำขอเบิกเลขที่ #${result.id} สำเร็จ`);
    } catch (err) {
      alert(err.message);
    } finally {
      setAssetRequestLoading(false);
    }
  };

  const editAssetRequest = async (request) => {
    const requester = window.prompt('ชื่อผู้ขอ', request.requester || '');
    if (requester === null) return;
    const department = window.prompt('แผนก', request.department || '');
    if (department === null) return;
    const itemType = window.prompt('ประเภทอุปกรณ์', request.item_type || '');
    if (itemType === null) return;
    const purpose = window.prompt('เหตุผลการใช้งาน', request.purpose || '');
    if (purpose === null) return;
    const dueDate = window.prompt('กำหนดคืน (YYYY-MM-DD หรือเว้นว่าง)', request.due_date ? String(request.due_date).slice(0, 10) : '');
    if (dueDate === null) return;
    const notes = window.prompt('หมายเหตุ', request.notes || '');
    if (notes === null) return;

    if (![requester, department, itemType, purpose].every(value => value.trim())) {
      alert('กรุณากรอกชื่อผู้ขอ แผนก ประเภทอุปกรณ์ และเหตุผลให้ครบ');
      return;
    }
    if (!window.confirm(`ยืนยันบันทึกการแก้ไขคำขอ #${request.id} หรือไม่?`)) return;

    setAssetRequestLoading(true);
    try {
      const response = await authFetch(`${API_BASE}/api/asset-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester, department, itemType, purpose, dueDate, notes })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'แก้ไขคำขอไม่สำเร็จ');
      await loadAssetRequests();
      alert(`แก้ไขคำขอ #${request.id} สำเร็จ`);
    } catch (err) {
      alert(err.message);
    } finally {
      setAssetRequestLoading(false);
    }
  };

  const runAssetRequestAction = async (request, action) => {
    const payload = { action };
    if (action === 'approve') {
      const allAssets = [...assetsList]
        .sort((left, right) => Number(left.sn || 0) - Number(right.sn || 0));
      const vacantAssets = allAssets.filter(asset => normalizeAssetStatus(asset.status) === 'ว่าง');
      if (vacantAssets.length === 0) return alert('ไม่มีอุปกรณ์สถานะว่างสำหรับอนุมัติ');
      const choices = allAssets.map(asset => `${asset.sn}: ${asset.itemType} (${asset.deviceSerial}) — ${normalizeAssetStatus(asset.status)}`).join('\n');
      const selected = window.prompt(`กรอกลำดับหรือ Serial อุปกรณ์ที่ต้องการจอง\nอุปกรณ์ทั้งหมด ${allAssets.length} เครื่อง · ว่างพร้อมส่งมอบ ${vacantAssets.length} เครื่อง\nเช่น 29 หรือ iPhone-004 (รองรับกรณีคีย์บอร์ดไทย)\n\n${choices}`);
      if (selected === null) return;
      const lookupTerms = new Set([
        normalizeAssetLookup(selected),
        normalizeAssetLookup(selected, true),
      ]);
      const selectedAsset = assetsList.find((asset) => (
        lookupTerms.has(normalizeAssetLookup(asset.sn)) ||
        lookupTerms.has(normalizeAssetLookup(asset.deviceSerial))
      ));
      if (!selectedAsset) return alert('ไม่พบลำดับหรือ Serial นี้ในทะเบียนอุปกรณ์');
      if (normalizeAssetStatus(selectedAsset.status) !== 'ว่าง') {
        return alert(`พบ ${selectedAsset.deviceSerial || selectedAsset.sn} แต่สถานะปัจจุบันคือ “${selectedAsset.status}” ยังไม่พร้อมจอง`);
      }
      payload.assetSn = Number(selectedAsset.sn);
      payload.reviewer = window.prompt('ชื่อผู้อนุมัติ / เจ้าหน้าที่ IT') || 'IT';
    } else if (action === 'reject') {
      const note = window.prompt('ระบุเหตุผลที่ไม่อนุมัติ');
      if (note === null) return;
      payload.note = note;
      payload.reviewer = window.prompt('ชื่อผู้พิจารณา') || 'IT';
    } else if (action === 'issue') {
      const workflowType = window.prompt('ประเภทการดำเนินการ: เบิก, เปลี่ยนอุปกรณ์ หรือ ลาออก', request.workflow_type === 'replacement' ? 'เปลี่ยนอุปกรณ์' : request.workflow_type === 'resignation' ? 'ลาออก' : 'เบิก');
      if (workflowType === null) return;
      const workflowMap = { 'เบิก': 'checkout', 'เปลี่ยนอุปกรณ์': 'replacement', 'ลาออก': 'resignation' };
      if (!workflowMap[workflowType]) return alert('กรุณาระบุ เบิก, เปลี่ยนอุปกรณ์ หรือ ลาออก');
      payload.workflowType = workflowMap[workflowType];
      if (!window.confirm(`ยืนยันส่งมอบอุปกรณ์ให้ ${request.requester}?`)) return;
      payload.reviewer = window.prompt('ชื่อเจ้าหน้าที่ผู้ส่งมอบ') || request.reviewer || 'IT';
    } else if (action === 'request_return') {
      const workflowType = window.prompt('เหตุผลการคืน: เปลี่ยนอุปกรณ์, เบิก หรือ ลาออก', request.workflow_type === 'replacement' ? 'เปลี่ยนอุปกรณ์' : request.workflow_type === 'resignation' ? 'ลาออก' : 'เบิก');
      if (workflowType === null) return;
      const workflowMap = { 'เบิก': 'checkout', 'เปลี่ยนอุปกรณ์': 'replacement', 'ลาออก': 'resignation' };
      if (!workflowMap[workflowType]) return alert('กรุณาระบุ เบิก, เปลี่ยนอุปกรณ์ หรือ ลาออก');
      payload.workflowType = workflowMap[workflowType];
      if (!assetReturnIdentity.trim()) return alert('กรุณาระบุชื่อผู้คืนก่อน');
      if (!window.confirm(`ยืนยันแจ้งขอคืนอุปกรณ์ ${request.device_serial || request.item_type} ให้ IT ตรวจรับใช่หรือไม่?`)) return;
      payload.requesterIdentity = assetReturnIdentity.trim();
      payload.reviewer = assetReturnIdentity.trim();
      payload.note = 'ผู้ใช้งานแจ้งขอคืนอุปกรณ์ รอเจ้าหน้าที่ IT ตรวจรับ';
    } else if (action === 'return') {
      const condition = window.prompt('สภาพตอนคืน: ปกติ, ชำรุด หรือ สูญหาย', 'ปกติ');
      if (condition === null) return;
      if (!['ปกติ', 'ชำรุด', 'สูญหาย'].includes(condition)) return alert('กรุณาระบุ ปกติ, ชำรุด หรือ สูญหาย');
      payload.condition = condition;
      payload.reviewer = window.prompt('ชื่อเจ้าหน้าที่ผู้ตรวจรับ') || 'IT';
      payload.note = window.prompt('หมายเหตุการรับคืน (ถ้ามี)') || '';
    }

    setAssetRequestLoading(true);
    try {
      const response = await authFetch(`${API_BASE}/api/asset-requests/${request.id}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'ดำเนินการไม่สำเร็จ');
      await Promise.all([loadAssetRequests(), refreshOperationalStateFromDb()]);
      if (action === 'request_return') alert('แจ้งขอคืนอุปกรณ์สำเร็จ กรุณานำอุปกรณ์ให้เจ้าหน้าที่ IT ตรวจรับ');
      if (action === 'return') alert('IT ตรวจรับอุปกรณ์และอัปเดตสถานะคลังสำเร็จ');
    } catch (err) {
      alert(err.message);
    } finally {
      setAssetRequestLoading(false);
    }
  };

  useEffect(() => {
    if (!['assetWorkflow', 'assetReturns'].includes(activeModal)) return undefined;
    loadAssetRequests();
    const timer = setInterval(loadAssetRequests, 3000);
    return () => clearInterval(timer);
  }, [activeModal, loadAssetRequests]);

  const isPollingUpdateRef = useRef(false);
  const isPendingSyncRef = useRef(false);
  const syncQueueRef = useRef(Promise.resolve());
  const latestDataRef = useRef(data);
  const latestAssetsRef = useRef(assetsList);
  const autoMonthKeyRef = useRef('');
  useEffect(() => {
    latestDataRef.current = data;
    latestAssetsRef.current = assetsList;
  }, [data, assetsList]);

  const syncStateToDb = useCallback(async (updatedData, updatedAssets) => {
    const operation = syncQueueRef.current.catch(() => undefined).then(async () => {
      let lastError;
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 30000);
        try {
          const response = await authFetch(`${API_BASE}/api/sync-all`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: updatedData, assetsList: updatedAssets }),
            signal: controller.signal
          });
          const result = await response.json().catch(() => ({}));
          if (response.ok) return result;
          lastError = new Error(result.error || `API server returned ${response.status}`);
          lastError.status = response.status;
          if (![500, 502, 503].includes(response.status)) break;
        } catch (error) {
          lastError = error;
          if (error.name === 'AbortError') break;
        } finally {
          window.clearTimeout(timeout);
        }
        if (attempt < 2) await new Promise(resolve => window.setTimeout(resolve, 1200));
      }
      throw lastError || new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
    });
    syncQueueRef.current = operation;
    try {
      return await operation;
    } catch (err) {
      console.error('Failed to sync state to PostgreSQL database:', err);
      if (err.name === 'AbortError') throw new Error('เซิร์ฟเวอร์ใช้เวลาบันทึกนานเกิน 30 วินาที กรุณาลองใหม่');
      throw err;
    }
  }, []);

  // Load state from Render PostgreSQL database on mount
  useEffect(() => {
    async function loadDbState() {
      try {
        const res = await authFetch(`${API_BASE}/api/db-state`, { cache: 'no-store' });
        if (!res.ok) throw new Error('API server returned error');
        const result = await res.json();
        
        if (result.data && Object.keys(result.data).length > 0) {
          isPollingUpdateRef.current = true;
          setData(repairThaiTextDeep(result.data));
          if (result.assetsList) {
            setAssetsList(repairThaiTextDeep(result.assetsList));
          }
          console.log('Successfully synced dashboard state with Render PostgreSQL database.');
        } else {
          // Database is empty. Seed it with the default initial data!
          console.log('PostgreSQL database is empty. Seeding initial baseline datasets...');
          await authFetch(`${API_BASE}/api/sync-all`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: latestDataRef.current, assetsList: latestAssetsRef.current })
          });
        }
      } catch (err) {
        console.warn('Could not connect to Render PostgreSQL API server. Operating in offline/localStorage mode.', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadDbState();
  }, []);

  // Poll database state every 3 seconds for real-time synchronization
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(async () => {
      // If we have local changes pending database sync, skip polling to avoid race overwrites!
      if (isPendingSyncRef.current) {
        console.log('Sync in progress, skipping polling interval.');
        return;
      }

      try {
        const pendingSyncRaw = localStorage.getItem('it_dashboard_pending_sync');
        if (pendingSyncRaw) {
          const pendingSync = JSON.parse(pendingSyncRaw);
          if (pendingSync?.type === 'asset_patch' && pendingSync?.sn && pendingSync?.payload) {
            isPendingSyncRef.current = true;
            const pendingResponse = await authFetch(`${API_BASE}/api/assets/${pendingSync.sn}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pendingSync.payload)
            });
            const pendingResult = await pendingResponse.json().catch(() => ({}));
            if (!pendingResponse.ok) throw new Error(pendingResult.error || `API ${pendingResponse.status}`);
            localStorage.removeItem('it_dashboard_pending_sync');
            setConsoleSaveMessage('ซิงค์หมายเหตุที่รอบันทึกขึ้นฐานข้อมูลสำเร็จแล้ว');
          }
        }

        const res = await authFetch(`${API_BASE}/api/db-state`, { cache: 'no-store' });
        if (!res.ok) return;
        const result = await res.json();

        // Check again after fetch completes in case sync was initiated during network roundtrip
        if (isPendingSyncRef.current) return;

        const currentLocalData = latestDataRef.current;
        const currentLocalAssets = latestAssetsRef.current;

        const repairedData = repairThaiTextDeep(result.data);
        const repairedAssets = repairThaiTextDeep(result.assetsList);
        const hasDataChanged = JSON.stringify(repairedData) !== JSON.stringify(currentLocalData);
        const hasAssetsChanged = JSON.stringify(repairedAssets) !== JSON.stringify(currentLocalAssets);

        if (hasDataChanged || hasAssetsChanged) {
          isPollingUpdateRef.current = true;
          if (hasDataChanged) setData(repairedData);
          if (hasAssetsChanged) setAssetsList(repairedAssets);
          console.log('Real-time update synced from Render PostgreSQL.');
        }
      } catch (err) {
        console.warn('Real-time sync poll failed:', err.message);
      } finally {
        isPendingSyncRef.current = false;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoaded]);

  // Read-only notification watcher. Existing records become the initial baseline;
  // only records created afterwards are announced, so historical data is untouched.
  useEffect(() => {
    if (!isLoaded) return undefined;

    let cancelled = false;
    const seenTicketKey = 'it_dashboard_seen_ticket_ids';
    const seenRequestKey = 'it_dashboard_seen_asset_request_ids';
    const seenReturnRequestKey = 'it_dashboard_seen_return_request_ids';
    const returnNotificationBaselineKey = 'it_dashboard_return_notification_baseline';

    const readSeenIds = (key) => {
      try {
        return new Set(JSON.parse(localStorage.getItem(key) || '[]').map(String));
      } catch {
        return new Set();
      }
    };

    const seenTickets = readSeenIds(seenTicketKey);
    const seenRequests = readSeenIds(seenRequestKey);
    const seenReturnRequests = readSeenIds(seenReturnRequestKey);
    let returnNotificationBaselineReady = localStorage.getItem(returnNotificationBaselineKey) === 'ready';

    const saveSeenIds = (key, values) => {
      localStorage.setItem(key, JSON.stringify(Array.from(values).slice(-1000)));
    };

    const announce = (item) => {
      if ('Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(item.title, {
          body: item.message,
          icon: fernAesthetiqueLogo,
          tag: item.key
        });
      }
    };

    const pollNewItems = async () => {
      try {
        const [dashboardResponse, requestsResponse] = await Promise.all([
          authFetch(`${API_BASE}/api/db-state`, { cache: 'no-store' }),
          authFetch(`${API_BASE}/api/asset-requests`, { cache: 'no-store' })
        ]);
        if (!dashboardResponse.ok || !requestsResponse.ok) return;

        const [dashboardResult, requestResult] = await Promise.all([
          dashboardResponse.json(),
          requestsResponse.json()
        ]);
        if (cancelled) return;

        const ticketRows = Object.values(dashboardResult.data || {})
          .flatMap(month => Array.isArray(month.ticketsList) ? month.ticketsList : []);
        const requestRows = Array.isArray(requestResult) ? requestResult : [];
        setAssetRequests(requestRows);

        if (!notificationInitializedRef.current && seenTickets.size === 0 && seenRequests.size === 0) {
          ticketRows.forEach(ticket => seenTickets.add(String(ticket.sn)));
          requestRows.forEach(request => seenRequests.add(String(request.id)));
          requestRows
            .filter(request => request.status === 'return_requested')
            .forEach(request => seenReturnRequests.add(String(request.id)));
          saveSeenIds(seenTicketKey, seenTickets);
          saveSeenIds(seenRequestKey, seenRequests);
          saveSeenIds(seenReturnRequestKey, seenReturnRequests);
          localStorage.setItem(returnNotificationBaselineKey, 'ready');
          returnNotificationBaselineReady = true;
          notificationInitializedRef.current = true;
          return;
        }

        if (!returnNotificationBaselineReady) {
          requestRows
            .filter(request => request.status === 'return_requested')
            .forEach(request => seenReturnRequests.add(String(request.id)));
          saveSeenIds(seenReturnRequestKey, seenReturnRequests);
          localStorage.setItem(returnNotificationBaselineKey, 'ready');
          returnNotificationBaselineReady = true;
        }

        ticketRows.forEach(ticket => {
          const id = String(ticket.sn);
          if (seenTickets.has(id)) return;
          seenTickets.add(id);
          announce({
            key: `ticket-${id}`,
            type: 'ticket',
            title: `แจ้ง Ticket ใหม่ #${id}`,
            message: `${ticket.complainant || 'ผู้แจ้งไม่ระบุชื่อ'}: ${ticket.issue || 'ไม่มีรายละเอียด'}`,
            createdAt: new Date().toISOString()
          });
        });

        requestRows.forEach(request => {
          const id = String(request.id);
          if (seenRequests.has(id)) return;
          seenRequests.add(id);
          announce({
            key: `asset-request-${id}`,
            type: 'asset',
            title: `คำขอเบิกอุปกรณ์ใหม่ #${id}`,
            message: `${request.requester || 'ผู้ขอไม่ระบุชื่อ'} ขอ ${request.item_type || 'อุปกรณ์ IT'}`,
            createdAt: new Date().toISOString()
          });
        });

        requestRows
          .filter(request => request.status === 'return_requested')
          .forEach(request => {
            const id = String(request.id);
            if (seenReturnRequests.has(id)) return;
            seenReturnRequests.add(id);
            announce({
              key: `asset-return-${id}`,
              type: 'asset-return',
              title: `แจ้งขอคืนอุปกรณ์ #${id}`,
              message: `${request.requester || 'ผู้คืนไม่ระบุชื่อ'} ขอคืน ${request.device_serial || request.item_type || 'อุปกรณ์ IT'}`,
              createdAt: new Date().toISOString()
            });
          });

        saveSeenIds(seenTicketKey, seenTickets);
        saveSeenIds(seenRequestKey, seenRequests);
        saveSeenIds(seenReturnRequestKey, seenReturnRequests);
        notificationInitializedRef.current = true;
      } catch (error) {
        console.warn('Notification polling failed:', error.message);
      }
    };

    pollNewItems();
    const notificationTimer = window.setInterval(pollNewItems, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(notificationTimer);
    };
  }, [isLoaded]);

  // Auto-seed removed

  useEffect(() => {
    if (!isLoaded) return;
    if (isPollingUpdateRef.current) {
      isPollingUpdateRef.current = false;
      return;
    }
    
    // Mark pending sync lock immediately
    isPendingSyncRef.current = true;

    const timer = setTimeout(async () => {
      try {
        await syncStateToDb(data, assetsList);
      } finally {
        isPendingSyncRef.current = false;
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, assetsList, isLoaded, syncStateToDb]);

  // Create and select the current Bangkok month automatically. Rechecking
  // hourly also handles dashboards that remain open across a month boundary.
  useEffect(() => {
    if (!isLoaded) return undefined;

    const ensureCurrentMonth = () => {
      const dateParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
      }).formatToParts(new Date());
      const year = Number(dateParts.find((part) => part.type === 'year')?.value);
      const month = Number(dateParts.find((part) => part.type === 'month')?.value);
      if (!year || !month) return;

      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      if (autoMonthKeyRef.current === monthKey) return;
      autoMonthKeyRef.current = monthKey;
      setCurrentMonth(monthKey);
      setConsoleMonth(monthKey);

      setData((previous) => {
        if (previous[monthKey]) return previous;
        const previousMonthKey = Object.keys(previous)
          .filter((key) => key < monthKey)
          .sort((left, right) => right.localeCompare(left))[0];
        const baseData = previousMonthKey
          ? previous[previousMonthKey]
          : { ...initialDashboardData['2026-07'] };
        const monthData = {
          ...baseData,
          monthName: `${THAI_MONTH_LABELS[month - 1]} ${year + 543}`,
          totalAssets: latestAssetsRef.current.length,
          ticketsCount: 0,
          slaPercent: 0,
          responseTime: 0,
          resolutionTime: 0,
          csat: 5,
          repairCount: 0,
          repairCost: 0,
          securityIncidents: 0,
          topBrokenDevices: [],
          deptCosts: {},
          ticketsList: [],
        };
        return { ...previous, [monthKey]: monthData };
      });
    };

    ensureCurrentMonth();
    const interval = window.setInterval(ensureCurrentMonth, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [isLoaded]);
  
  // New Month creation states
  const [newMonthKey, setNewMonthKey] = useState('');
  const [newMonthName, setNewMonthName] = useState('');

  // New Project/Rec creation states
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newRecText, setNewRecText] = useState('');

  // New Asset creation states
  const [newAssetUser, setNewAssetUser] = useState('');
  const [newAssetPosition, setNewAssetPosition] = useState('');
  const [newAssetItemType, setNewAssetItemType] = useState('');
  const [newAssetAdditionalEquipment, setNewAssetAdditionalEquipment] = useState('');
  const [newAssetSerial, setNewAssetSerial] = useState('');
  const [newAssetStatus, setNewAssetStatus] = useState('ใช้งาน');
  const [newAssetNotes, setNewAssetNotes] = useState('');
  const [newAssetSubmittedOn, setNewAssetSubmittedOn] = useState('');
  const [newAssetRespondent, setNewAssetRespondent] = useState('');
  const [newAssetDate, setNewAssetDate] = useState('');
  const [newAssetSoftwareApp, setNewAssetSoftwareApp] = useState('');
  const [newAssetRegisteredEmail, setNewAssetRegisteredEmail] = useState('');
  const [newAssetAdditionalSerial, setNewAssetAdditionalSerial] = useState('');
  const [newAssetReturnDueDate, setNewAssetReturnDueDate] = useState('');
  const [newAssetAuditDate, setNewAssetAuditDate] = useState('');
  const [newAssetPurchaseDate, setNewAssetPurchaseDate] = useState('');
  const [newAssetProductionYear, setNewAssetProductionYear] = useState('');
  const [newAssetWarrantyExpiry, setNewAssetWarrantyExpiry] = useState('');
  const [newAssetCost, setNewAssetCost] = useState('');
  const [newAssetMarketModel, setNewAssetMarketModel] = useState('');
  const [newAssetMarketPrice, setNewAssetMarketPrice] = useState('');
  const [newAssetPriceAvailability, setNewAssetPriceAvailability] = useState('current');
  const [newAssetPriceSourceUrl, setNewAssetPriceSourceUrl] = useState('');
  const [newAssetPriceCheckedAt, setNewAssetPriceCheckedAt] = useState('');


  // New Ticket creation states
  const [newTicketComplainant, setNewTicketComplainant] = useState('');
  const [newTicketEmail, setNewTicketEmail] = useState('');
  const [newTicketAnydesk, setNewTicketAnydesk] = useState('');
  const [newTicketIssue, setNewTicketIssue] = useState('');
  const [newTicketCause, setNewTicketCause] = useState('');
  const [newTicketDuration, setNewTicketDuration] = useState('00:30');
  const [newTicketResponder, setNewTicketResponder] = useState('');
  const [newTicketStatus, setNewTicketStatus] = useState('เสร็จสิ้น');
  const [newTicketCost, setNewTicketCost] = useState('0');

  // Form input states
  const [formInputs, setFormInputs] = useState({});

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('it_dashboard_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('it_dashboard_assets', JSON.stringify(assetsList));
  }, [assetsList]);

  // Upgraded Dynamic Recalculation Engine
  const recalculateMonthlyMetrics = (monthKey, tickets, assets) => {
    let durationSum = 0;
    let durationCount = 0;
    let slaCompliantCount = 0;
    let totalCost = 0;
    let repairCount = 0;
    const deviceCounts = {};
    const deptCosts = {};

    tickets.forEach(ticket => {
      const duration = ticket.duration || '-';
      if (duration && duration !== '-') {
        const parts = duration.split(':');
        if (parts.length === 2) {
          const mins = parseInt(parts[0]) * 60 + parseInt(parts[1]);
          if (!isNaN(mins)) {
            durationSum += mins;
            durationCount++;
            if (mins <= 60) {
              slaCompliantCount++;
            }
          }
        }
      }
      
      const cost = Number(ticket.cost) || 0;
      totalCost += cost;
      if (cost > 0 || ticket.status === 'จ่ายเงินแล้ว') {
        repairCount++;
      }

      // Track broken devices by category
      const issue = String(ticket.issue).toLowerCase();
      let matchedDevice = 'อื่น ๆ';
      if (issue.includes('notebook') || issue.includes('lenovo') || issue.includes('asus') || issue.includes('hp')) matchedDevice = 'Notebook';
      else if (issue.includes('computer') || issue.includes('pc')) matchedDevice = 'PC';
      else if (issue.includes('ipad')) matchedDevice = 'iPad';
      else if (issue.includes('iphone')) matchedDevice = 'iPhone';
      else if (issue.includes('printer') || issue.includes('ปริ้นเตอร์')) matchedDevice = 'Printer';
      else if (issue.includes('mornitor') || issue.includes('จอ')) matchedDevice = 'Monitor';
      else if (issue.includes('imac')) matchedDevice = 'iMac';
      else if (issue.includes('macbook')) matchedDevice = 'MacBook';
      else if (issue.includes('network') || issue.includes('lan') || issue.includes('wifi') || issue.includes('เน็ต')) matchedDevice = 'Network';

      if (ticket.status !== 'เสร็จสิ้น' || cost > 0) {
        deviceCounts[matchedDevice] = (deviceCounts[matchedDevice] || 0) + 1;
      }

      // Department costs mapping
      const borrowerAsset = assets.find(a => String(a.user).trim() === String(ticket.complainant).trim());
      const dept = borrowerAsset ? borrowerAsset.position : 'ส่วนกลาง';
      if (cost > 0) {
        deptCosts[dept] = (deptCosts[dept] || 0) + cost;
      }
    });

    const calculatedSla = durationCount > 0 ? Math.round((slaCompliantCount / durationCount) * 1000) / 10 : 0;
    const resolutionTimeHours = durationCount > 0 ? Number((durationSum / durationCount / 60).toFixed(1)) : 0;
    const calculatedResponseTime = durationCount > 0 ? Math.max(5, Math.round(resolutionTimeHours * 12)) : 0;
    const calculatedCsat = durationCount > 0 ? Number((4.5 + (calculatedSla / 100) * 0.4).toFixed(1)) : 0;

    const brokenAssetsCount = assets.filter(a => ['รอซ่อม', 'ชำรุด'].includes(normalizeAssetStatus(a.status))).length;
    const lostAssetsCount = assets.filter(a => normalizeAssetStatus(a.status) === 'สูญหาย').length;
    const vacantAssetsCount = assets.filter(a => normalizeAssetStatus(a.status) === 'ว่าง').length;

    const topBrokenDevices = Object.entries(deviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalAssetsVal = assets.length;
    return {
      totalAssets: totalAssetsVal,
      assetsBroken: brokenAssetsCount,
      assetsLost: lostAssetsCount,
      assetsVacant: vacantAssetsCount,
      ticketsCount: tickets.length,
      slaPercent: calculatedSla,
      resolutionTime: resolutionTimeHours,
      responseTime: calculatedResponseTime,
      csat: calculatedCsat,
      repairCount: repairCount,
      repairCost: totalCost,
      topBrokenDevices: topBrokenDevices,
      deptCosts: deptCosts
    };
  };

  const runRecalculation = (monthKey, currentTickets, currentAssets) => {
    const newMetrics = recalculateMonthlyMetrics(monthKey, currentTickets, currentAssets);
    setData(prev => ({
      ...prev,
      [monthKey]: {
        ...prev[monthKey],
        ...newMetrics,
        ticketsList: currentTickets
      }
    }));
  };

  // Recalculate metrics for all months whenever assetsList changes
  useEffect(() => {
    setData(prev => {
      let updated = false;
      const nextData = { ...prev };
      Object.keys(nextData).forEach(monthKey => {
        const monthData = nextData[monthKey];
        const tickets = monthData.ticketsList || [];
        const newMetrics = recalculateMonthlyMetrics(monthKey, tickets, assetsList);
        // Asset KPIs can be entered manually in the KPI editor. Asset workflow
        // endpoints update these values in the database when the registry changes,
        // so a background assetsList refresh must not overwrite saved KPI values.
        delete newMetrics.totalAssets;
        delete newMetrics.assetsBroken;
        delete newMetrics.assetsLost;
        delete newMetrics.assetsVacant;
        
        let changed = false;
        for (const k of Object.keys(newMetrics)) {
          if (JSON.stringify(newMetrics[k]) !== JSON.stringify(monthData[k])) {
            changed = true;
            break;
          }
        }
        if (changed) {
          nextData[monthKey] = {
            ...monthData,
            ...newMetrics
          };
          updated = true;
        }
      });
      return updated ? nextData : prev;
    });
  }, [assetsList]);

  // Console Months Manager Handlers
  const handleAddMonth = (e) => {
    e.preventDefault();
    if (!newMonthKey || !newMonthName) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (data[newMonthKey]) {
      alert('มีรหัสเดือนนี้ในระบบอยู่แล้ว');
      return;
    }
    const latestMonthKey = Object.keys(data).sort((a, b) => b.localeCompare(a))[0];
    const baseData = latestMonthKey ? data[latestMonthKey] : {};

    const newMonthData = {
      ...baseData,
      monthName: newMonthName,
      totalAssets: assetsList.length,
      assetValue: baseData.assetValue || 0,
      
      // Reset monthly operational metrics
      ticketsCount: 0,
      slaPercent: 0,
      responseTime: 0,
      resolutionTime: 0,
      csat: 5.0,
      repairCount: 0,
      repairCost: 0,
      securityIncidents: 0,
      // If there was no baseData, provide some defaults for arrays
      topBrokenDevices: baseData.topBrokenDevices || [],
      deptCosts: baseData.deptCosts || {},
      softwareExpiringDetails: baseData.softwareExpiringDetails || [],
      assetsExpiringDetails: baseData.assetsExpiringDetails || [],
      ongoingProjects: baseData.ongoingProjects || [],
      vendorContracts: baseData.vendorContracts || [],
      recommendations: baseData.recommendations || [],
      ticketsList: [] // DO NOT copy tickets to avoid duplicate SN conflict in DB
    };

    const updatedData = {
      ...data,
      [newMonthKey]: newMonthData
    };
    
    setData(updatedData);
    setConsoleMonth(newMonthKey);
    setCurrentMonth(newMonthKey);
    setNewMonthKey('');
    setNewMonthName('');
    
    // Force immediate sync so it doesn't get lost on quick refresh
    syncStateToDb(updatedData, assetsList).catch(err => console.error(err));
    
    alert(`เพิ่มเดือน ${newMonthName} สำเร็จ!`);
  };

  const handleDeleteMonth = (key) => {
    const keys = Object.keys(data);
    if (keys.length <= 1) {
      alert('ไม่สามารถลบเดือนสุดท้ายของระบบได้');
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบเดือน ${data[key].monthName} ใช่หรือไม่?`)) {
      setData(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      if (currentMonth === key) {
        setCurrentMonth(keys.find(k => k !== key));
      }
      if (consoleMonth === key) {
        setConsoleMonth(keys.find(k => k !== key));
      }
    }
  };

  // Inline KPI Change handler
  const handleKpiChange = (field, val) => {
    setData(prev => ({
      ...prev,
      [consoleMonth]: {
        ...prev[consoleMonth],
        [field]: val
      }
    }));
  };

  // Projects & Recs Editor Handlers
  const handleAddProject = () => {
    if (!newProjTitle) return;
    setData(prev => {
      const monthData = prev[consoleMonth] || {};
      return {
        ...prev,
        [consoleMonth]: {
          ...monthData,
          ongoingProjects: [...(monthData.ongoingProjects || []), { title: newProjTitle, desc: newProjDesc }]
        }
      };
    });
    setNewProjTitle('');
    setNewProjDesc('');
  };

  const handleDeleteProject = (idx) => {
    setData(prev => {
      const monthData = prev[consoleMonth];
      const updatedProjects = [...(monthData.ongoingProjects || [])];
      updatedProjects.splice(idx, 1);
      return {
        ...prev,
        [consoleMonth]: {
          ...monthData,
          ongoingProjects: updatedProjects
        }
      };
    });
  };

  const handleAddRecommendation = () => {
    if (!newRecText) return;
    setData(prev => {
      const monthData = prev[consoleMonth] || {};
      return {
        ...prev,
        [consoleMonth]: {
          ...monthData,
          recommendations: [...(monthData.recommendations || []), newRecText]
        }
      };
    });
    setNewRecText('');
  };

  const handleDeleteRecommendation = (idx) => {
    setData(prev => {
      const monthData = prev[consoleMonth];
      const updatedRecs = [...(monthData.recommendations || [])];
      updatedRecs.splice(idx, 1);
      return {
        ...prev,
        [consoleMonth]: {
          ...monthData,
          recommendations: updatedRecs
        }
      };
    });
  };

  // Assets Inventory Editor (Dual-Mode: Create / Update)
  const handleAddAsset = async () => {
    if (!newAssetItemType) {
      alert('กรุณากรอกประเภทอุปกรณ์หลัก');
      return;
    }

    if (editingAssetSn !== null) {
      const assetPatch = {
        user: normalizeAssetStatus(newAssetStatus) === 'ว่าง' ? 'ส่วนกลาง' : (newAssetUser || 'ส่วนกลาง'),
        position: normalizeAssetStatus(newAssetStatus) === 'ว่าง' ? '-' : (newAssetPosition || '-'),
        itemType: newAssetItemType,
        additionalEquipment: newAssetAdditionalEquipment,
        deviceSerial: newAssetSerial || '-',
        status: normalizeAssetStatus(newAssetStatus),
        notes: newAssetNotes,
        submittedOn: newAssetSubmittedOn,
        respondent: newAssetRespondent,
        date: newAssetDate,
        softwareApp: newAssetSoftwareApp,
        registeredEmail: newAssetRegisteredEmail,
        additionalSerial: newAssetAdditionalSerial,
        returnDueDate: newAssetReturnDueDate,
        auditDate: newAssetAuditDate,
          purchaseDate: newAssetPurchaseDate,
          productionYear: newAssetProductionYear,
          warrantyExpiry: newAssetWarrantyExpiry,
        cost: newAssetCost,
        marketModel: newAssetMarketModel,
        marketPrice: Number(newAssetMarketPrice) || 0,
        priceAvailability: newAssetPriceAvailability,
        priceSourceUrl: newAssetPriceSourceUrl,
        priceCheckedAt: newAssetPriceCheckedAt
      };

      setConsoleSaving(true);
      setConsoleSaveMessage('');
      isPendingSyncRef.current = true;
      try {
        // Finish any older queued snapshot before applying this record edit.
        // Otherwise a stale snapshot can land after PATCH and restore old data.
        await syncQueueRef.current.catch(() => undefined);
        const response = await authFetch(`${API_BASE}/api/assets/${editingAssetSn}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetPatch)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'แก้ไขทรัพย์สินไม่สำเร็จ');

        if (result.asset) {
          setAssetsList(previous => previous.map(asset => (
            Number(asset.sn) === Number(result.asset.sn) ? repairThaiTextDeep(result.asset) : asset
          )));
        }

        const stateResponse = await authFetch(`${API_BASE}/api/db-state`, { cache: 'no-store' });
        if (!stateResponse.ok) throw new Error(`API server returned ${stateResponse.status}`);
        const synchronized = await stateResponse.json();
        if (synchronized.data) setData(repairThaiTextDeep(synchronized.data));
        if (synchronized.assetsList) setAssetsList(repairThaiTextDeep(synchronized.assetsList));
        setEditingAssetSn(null);
        setConsoleSaveMessage('บันทึกสำเร็จและอัปเดตสถานะในฐานข้อมูลแล้ว');
        alert('แก้ไขข้อมูลทรัพย์สินสำเร็จ!');
      } catch (error) {
        console.error('Failed to update asset:', error);
        setConsoleSaveMessage(`บันทึกไม่สำเร็จ: ${error?.message || 'กรุณาลองใหม่'}`);
        alert(`บันทึกไม่สำเร็จ: ${error?.message || 'กรุณาลองใหม่'}`);
        return;
      } finally {
        isPendingSyncRef.current = false;
        setConsoleSaving(false);
      }
    } else {
      // Create mode
      const newAsset = {
        sn: assetsList.length > 0 ? Math.max(...assetsList.map(a => Number(a.sn) || 0)) + 1 : 1,
        user: normalizeAssetStatus(newAssetStatus) === 'ว่าง' ? 'ส่วนกลาง' : (newAssetUser || 'ส่วนกลาง'),
        position: normalizeAssetStatus(newAssetStatus) === 'ว่าง' ? '-' : (newAssetPosition || '-'),
        itemType: newAssetItemType,
        additionalEquipment: newAssetAdditionalEquipment,
        deviceSerial: newAssetSerial || '-',
        status: normalizeAssetStatus(newAssetStatus),
        notes: newAssetNotes,
        submittedOn: newAssetSubmittedOn,
        respondent: newAssetRespondent,
        date: newAssetDate || new Date().toLocaleDateString('th-TH'),
        softwareApp: newAssetSoftwareApp,
        registeredEmail: newAssetRegisteredEmail,
        additionalSerial: newAssetAdditionalSerial,
        returnDueDate: newAssetReturnDueDate,
        auditDate: newAssetAuditDate,
          purchaseDate: newAssetPurchaseDate,
          productionYear: newAssetProductionYear,
          warrantyExpiry: newAssetWarrantyExpiry,
        cost: newAssetCost,
        marketModel: newAssetMarketModel,
        marketPrice: Number(newAssetMarketPrice) || 0,
        priceAvailability: newAssetPriceAvailability,
        priceSourceUrl: newAssetPriceSourceUrl,
        priceCheckedAt: newAssetPriceCheckedAt
      };
      setAssetsList(prev => {
        const updated = [...prev, newAsset];
        runRecalculation(consoleMonth, data[consoleMonth]?.ticketsList || [], updated);
        return updated;
      });
      alert('เพิ่มทรัพย์สินเข้าคลังสำเร็จ!');
    }

    setNewAssetUser('');
    setNewAssetPosition('');
    setNewAssetItemType('');
    setNewAssetAdditionalEquipment('');
    setNewAssetSerial('');
    setNewAssetStatus('ใช้งาน');
    setNewAssetNotes('');
    setNewAssetSubmittedOn('');
    setNewAssetRespondent('');
    setNewAssetDate('');
    setNewAssetSoftwareApp('');
    setNewAssetRegisteredEmail('');
    setNewAssetAdditionalSerial('');
    setNewAssetReturnDueDate('');
    setNewAssetAuditDate('');
    setNewAssetPurchaseDate('');
    setNewAssetProductionYear('');
    setNewAssetWarrantyExpiry('');
    setNewAssetCost('');
    setNewAssetMarketModel('');
    setNewAssetMarketPrice('');
    setNewAssetPriceAvailability('current');
    setNewAssetPriceSourceUrl('');
    setNewAssetPriceCheckedAt('');
    setEditingAssetTagField(null);
  };

  const handleLoadEditAsset = (asset) => {
    setEditingAssetSn(asset.sn);
    setNewAssetUser(asset.user);
    setNewAssetPosition(asset.position);
    setNewAssetItemType(asset.itemType);
    setNewAssetAdditionalEquipment(asset.additionalEquipment || '');
    setNewAssetSerial(asset.deviceSerial || '');
    setNewAssetStatus(asset.status || 'ใช้งาน');
    setNewAssetNotes(asset.notes || '');
    setNewAssetSubmittedOn(asset.submittedOn || '');
    setNewAssetRespondent(asset.respondent || '');
    setNewAssetDate(asset.date || '');
    setNewAssetSoftwareApp(asset.softwareApp || '');
    setNewAssetRegisteredEmail(asset.registeredEmail || '');
    setNewAssetAdditionalSerial(asset.additionalSerial || '');
    setNewAssetReturnDueDate(asset.returnDueDate || '');
    setNewAssetAuditDate(asset.auditDate || '');
    setNewAssetPurchaseDate(asset.purchaseDate || '');
    setNewAssetProductionYear(asset.productionYear || '');
    setNewAssetWarrantyExpiry(asset.warrantyExpiry || '');
    setNewAssetCost(asset.cost || '');
    setNewAssetMarketModel(asset.marketModel || '');
    setNewAssetMarketPrice(asset.marketPrice || '');
    setNewAssetPriceAvailability(asset.priceAvailability || 'current');
    setNewAssetPriceSourceUrl(asset.priceSourceUrl || '');
    setNewAssetPriceCheckedAt(asset.priceCheckedAt || '');
  };

  const handleCancelEditAsset = () => {
    setEditingAssetSn(null);
    setEditingAssetTagField(null);
    setNewAssetUser('');
    setNewAssetPosition('');
    setNewAssetItemType('');
    setNewAssetAdditionalEquipment('');
    setNewAssetSerial('');
    setNewAssetStatus('ใช้งาน');
    setNewAssetNotes('');
    setNewAssetSubmittedOn('');
    setNewAssetRespondent('');
    setNewAssetDate('');
    setNewAssetSoftwareApp('');
    setNewAssetRegisteredEmail('');
    setNewAssetAdditionalSerial('');
    setNewAssetReturnDueDate('');
    setNewAssetAuditDate('');
    setNewAssetPurchaseDate('');
    setNewAssetProductionYear('');
    setNewAssetWarrantyExpiry('');
    setNewAssetCost('');
  };

  const handleDeleteAsset = (sn) => {
    if (window.confirm('คุณต้องการลบอุปกรณ์นี้ออกจากทะเบียนคลังใช่หรือไม่?')) {
      setAssetsList(prev => {
        const updated = prev.filter(a => a.sn !== sn);
        runRecalculation(consoleMonth, data[consoleMonth]?.ticketsList || [], updated);
        return updated;
      });
      if (editingAssetSn === sn) {
        handleCancelEditAsset();
      }
    }
  };

  // Ticket Log Editor (Dual-Mode: Create / Update)
  const handleAddTicket = () => {
    if (!newTicketIssue) {
      alert('กรุณากรอกอาการเสีย/ปัญหา');
      return;
    }

    const tickets = data[consoleMonth]?.ticketsList || [];

    if (editingTicketSn !== null) {
      // Edit mode
      const updatedTickets = tickets.map(t => t.sn === editingTicketSn ? {
        ...t,
        complainant: newTicketComplainant || 'ไม่ระบุชื่อ',
        email: newTicketEmail || '-',
        anydesk: newTicketAnydesk || '-',
        issue: newTicketIssue,
        cause: newTicketCause || '-',
        duration: newTicketDuration,
        responder: newTicketResponder || '-',
        status: newTicketStatus,
        cost: Number(newTicketCost) || 0
      } : t);

      runRecalculation(consoleMonth, updatedTickets, assetsList);
      setEditingTicketSn(null);
      alert('แก้ไขข้อมูลงานแจ้งซ่อมสำเร็จ!');
    } else {
      // Create mode
      const newTicket = {
        sn: tickets.length > 0 ? Math.max(...tickets.map(t => Number(t.sn) || 0)) + 1 : 1,
        date: new Date().toLocaleString('th-TH', { hour12: false }).replace(',', ''),
        complainant: newTicketComplainant || 'ไม่ระบุชื่อ',
        email: newTicketEmail || '-',
        anydesk: newTicketAnydesk || '-',
        issue: newTicketIssue,
        cause: newTicketCause || '-',
        duration: newTicketDuration,
        responder: newTicketResponder || '-',
        status: newTicketStatus,
        cost: Number(newTicketCost) || 0
      };

      const updatedTickets = [...tickets, newTicket];
      runRecalculation(consoleMonth, updatedTickets, assetsList);
      alert('เพิ่มประวัติงานแจ้งซ่อมสำเร็จ!');
    }

    setNewTicketComplainant('');
    setNewTicketEmail('');
    setNewTicketAnydesk('');
    setNewTicketIssue('');
    setNewTicketCause('');
    setNewTicketDuration('00:30');
    setNewTicketResponder('');
    setNewTicketStatus('เสร็จสิ้น');
    setNewTicketCost('0');
  };

  const handleLoadEditTicket = (ticket) => {
    setEditingTicketSn(ticket.sn);
    setNewTicketComplainant(ticket.complainant);
    setNewTicketEmail(ticket.email || '');
    setNewTicketAnydesk(ticket.anydesk || '');
    setNewTicketIssue(ticket.issue);
    setNewTicketCause(ticket.cause || '');
    setNewTicketDuration(ticket.duration);
    setNewTicketResponder(ticket.responder);
    setNewTicketStatus(ticket.status);
    setNewTicketCost(String(ticket.cost || 0));
  };

  const handleCancelEditTicket = () => {
    setEditingTicketSn(null);
    setNewTicketComplainant('');
    setNewTicketEmail('');
    setNewTicketAnydesk('');
    setNewTicketIssue('');
    setNewTicketCause('');
    setNewTicketDuration('00:30');
    setNewTicketResponder('');
    setNewTicketStatus('เสร็จสิ้น');
    setNewTicketCost('0');
  };

  const handleDeleteTicket = (sn) => {
    if (window.confirm('คุณต้องการลบรายการแจ้งซ่อมนี้ใช่หรือไม่?')) {
      const updatedTickets = (data[consoleMonth]?.ticketsList || []).filter(t => t.sn !== sn);
      runRecalculation(consoleMonth, updatedTickets, assetsList);
      if (editingTicketSn === sn) {
        handleCancelEditTicket();
      }
    }
  };

  // JSON operations and reset
  const handleExportJson = () => {
    const backupData = {
      data,
      assetsList
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `it_dashboard_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed.data && parsed.assetsList) {
          setData(parsed.data);
          setAssetsList(parsed.assetsList);
          alert('นำเข้าข้อมูลสำรองสำเร็จ!');
        } else {
          alert('รูปแบบไฟล์สำรองไม่ถูกต้อง');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = async () => {
    if (window.confirm('คำเตือน: คุณต้องการลบข้อมูลทั้งหมดในระบบใช่หรือไม่? ข้อมูลทั้งหมดที่บันทึกไว้ในฐานข้อมูลจะถูกล้างและไม่สามารถกู้คืนได้!')) {
      try {
        const response = await authFetch(`${API_BASE}/api/reset-database`, {
          method: 'POST'
        });
        if (!response.ok) {
          throw new Error('ไม่สามารถลบข้อมูลฐานข้อมูลได้');
        }
        localStorage.removeItem('it_dashboard_data');
        localStorage.removeItem('it_dashboard_assets');
        setData([]);
        setAssetsList([]);
        setCurrentMonth('2026-07');
        setConsoleMonth('2026-07');
        setEditingAssetSn(null);
        setEditingTicketSn(null);
        alert('ลบข้อมูลทั้งหมดเรียบร้อยแล้ว ระบบว่างเปล่าเหมือนเริ่มต้นใหม่');
        window.location.reload();
      } catch (error) {
        console.error('Error resetting database:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
      }
    }
  };

  const handleLarkSubmit = async (e) => {
    e.preventDefault();
    if (larkFormType === 'ticket') {
      if (larkTicketRole === 'it') {
        if (!selectedPendingTicketSn) {
          alert('กรุณาเลือกใบงานที่ต้องการปิดงาน');
          return;
        }
        if (!larkTicketResponder) {
          alert('กรุณากรอกชื่อผู้ดำเนินงาน (ช่าง IT)');
          return;
        }
        
        // IT Close work mode - persist through the API before removing it from the queue.
        try {
          const response = await authFetch(`${API_BASE}/api/tickets/${selectedPendingTicketSn}/close`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              responder: larkTicketResponder,
              duration: larkTicketDuration || '00:30',
              cause: larkTicketCause || '-',
              cost: Number(larkTicketCost) || 0,
              status: larkTicketStatus
            })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'ปิดงานไม่สำเร็จ');
          await refreshOperationalStateFromDb();
        } catch (error) {
          alert(error.message);
          return;
        }

        setSelectedPendingTicketSn('');
        setLarkTicketResponder('');
        setLarkTicketDuration('00:30');
        setLarkTicketCause('');
        setLarkTicketCost('0');
        setLarkTicketStatus('เสร็จสิ้น');
        setLarkSubmitted(true);
      } else {
        // User Submit Mode
        if (!larkTicketIssue) {
          alert('กรุณากรอกอาการเสีย/ปัญหา');
          return;
        }
        const linkedAsset = larkTicketAssetSerial
          ? assetsList.find(asset => String(asset.deviceSerial || '').toLocaleLowerCase('th-TH') === larkTicketAssetSerial.trim().toLocaleLowerCase('th-TH'))
          : null;
        if (larkTicketAssetSerial && !linkedAsset) {
          alert('ไม่พบหมายเลขเครื่องนี้ในทะเบียนทรัพย์สิน');
          return;
        }
        try {
          const response = await authFetch(`${API_BASE}/api/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: larkTicketComplainant || 'ไม่ระบุชื่อ',
              department: linkedAsset?.position || 'ไม่ระบุ',
              date: `${currentMonth}-01`,
              deviceType: linkedAsset?.itemType || 'Other',
              assetSerial: larkTicketAssetSerial.trim(),
              issue: larkTicketIssue,
              priority: 'medium',
              email: larkTicketEmail,
              anydesk: larkTicketAnydesk
            })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'บันทึกคำร้องไม่สำเร็จ');
          await Promise.all([refreshOperationalStateFromDb(), loadAssetRequests()]);
        } catch (error) {
          alert(error.message);
          return;
        }

        // Clear inputs
        setLarkTicketComplainant('');
        setLarkTicketEmail('');
        setLarkTicketAnydesk('');
        setLarkTicketAssetSerial('');
        setLarkTicketIssue('');
        setLarkSubmitted(true);
      }
    } else {
      if (!larkAssetItemType) {
        alert('กรุณากรอกประเภทอุปกรณ์หลัก');
        return;
      }
      const newAsset = {
        sn: assetsList.length > 0 ? Math.max(...assetsList.map(a => Number(a.sn) || 0)) + 1 : 1,
        date: new Date().toLocaleDateString('th-TH'),
        user: larkAssetUser || 'ส่วนกลาง',
        position: larkAssetPosition || '-',
        itemType: larkAssetItemType,
        deviceSerial: larkAssetSerial || '-',
        status: larkAssetStatus,
        notes: larkAssetNotes
      };

      setAssetsList(prev => {
        const updated = [...prev, newAsset];
        runRecalculation(currentMonth, data[currentMonth]?.ticketsList || [], updated);
        return updated;
      });

      // Clear inputs
      setLarkAssetUser('');
      setLarkAssetPosition('');
      setLarkAssetItemType('');
      setLarkAssetSerial('');
      setLarkAssetStatus('ใช้งาน');
      setLarkAssetNotes('');
      setLarkSubmitted(true);
    }
  };

  // Hidden file input ref for xlsx import
  const fileInputRef = useRef(null);

  // Chart canvas refs
  const assetCanvasRef = useRef(null);
  const softwareCanvasRef = useRef(null);
  const repairCanvasRef = useRef(null);

  // Chart instances trackers
  const assetChartInst = useRef(null);
  const softwareChartInst = useRef(null);
  const repairChartInst = useRef(null);

  const availableMonthKeys = Object.keys(data).sort();
  const fallbackMonthKey = availableMonthKeys[availableMonthKeys.length - 1] || '2026-07';
  const activeDataSource = data[currentMonth] || data[fallbackMonthKey] || initialDashboardData['2026-07'];
  const activeData = useMemo(() => ({
    ...initialDashboardData['2026-07'],
    ...activeDataSource,
    monthName: activeDataSource?.monthName || fallbackMonthKey,
    totalAssets: Number(activeDataSource?.totalAssets || 0),
    ticketsCount: Number(activeDataSource?.ticketsCount || 0),
    csat: Number(activeDataSource?.csat || 0),
    deptCosts: activeDataSource?.deptCosts || {},
    topBrokenDevices: activeDataSource?.topBrokenDevices || [],
    recommendations: activeDataSource?.recommendations || [],
    ongoingProjects: activeDataSource?.ongoingProjects || [],
    assetsExpiringDetails: activeDataSource?.assetsExpiringDetails || [],
    softwareExpiringDetails: activeDataSource?.softwareExpiringDetails || [],
    ticketsList: activeDataSource?.ticketsList || [],
  }), [activeDataSource, fallbackMonthKey]);
  const structuredProjects = activeData.ongoingProjects.filter(project => project.projectType);
  const improvementMetrics = structuredProjects.length > 0 ? {
    automationsDone: structuredProjects.filter(project => project.projectType === 'Automation' && project.status === 'เสร็จสิ้น').length,
    aiApps: structuredProjects.filter(project => ['AI', 'AI & Infrastructure'].includes(project.projectType) && project.status !== 'ยกเลิก').length,
    hoursSaved: structuredProjects.reduce((sum, project) => sum + Number(project.hoursSaved || 0), 0),
  } : {
    automationsDone: Number(activeData.automationsDone || 0),
    aiApps: Number(activeData.aiApps || 0),
    hoursSaved: Number(activeData.hoursSaved || 0),
  };

  const saveConsoleChanges = async () => {
    setConsoleSaving(true);
    setConsoleSaveMessage('');
    isPendingSyncRef.current = true;
    let assetsToSave = assetsList;
    let dataToSave = data;
    let pendingAssetPatch = null;
    try {
      // If an asset is still open in edit mode, commit the visible form values
      // before sending the complete dashboard snapshot.
      if (editingAssetSn !== null && newAssetItemType) {
        pendingAssetPatch = {
          user: normalizeAssetStatus(newAssetStatus) === 'ว่าง' ? 'ส่วนกลาง' : (newAssetUser || 'ส่วนกลาง'),
          position: normalizeAssetStatus(newAssetStatus) === 'ว่าง' ? '-' : (newAssetPosition || '-'),
          itemType: newAssetItemType,
          additionalEquipment: newAssetAdditionalEquipment,
          deviceSerial: newAssetSerial || '-',
          status: normalizeAssetStatus(newAssetStatus),
          notes: newAssetNotes,
          submittedOn: newAssetSubmittedOn,
          respondent: newAssetRespondent,
          date: newAssetDate,
          softwareApp: newAssetSoftwareApp,
          registeredEmail: newAssetRegisteredEmail,
          additionalSerial: newAssetAdditionalSerial,
          returnDueDate: newAssetReturnDueDate,
          auditDate: newAssetAuditDate,
        purchaseDate: newAssetPurchaseDate,
        productionYear: newAssetProductionYear,
          warrantyExpiry: newAssetWarrantyExpiry,
          cost: newAssetCost,
          marketModel: newAssetMarketModel,
          marketPrice: Number(newAssetMarketPrice) || 0,
          priceAvailability: newAssetPriceAvailability,
          priceSourceUrl: newAssetPriceSourceUrl,
          priceCheckedAt: newAssetPriceCheckedAt
        };
        assetsToSave = assetsList.map(asset => Number(asset.sn) === Number(editingAssetSn) ? {
          ...asset,
          user: normalizeAssetStatus(newAssetStatus) === 'ว่าง' ? 'ส่วนกลาง' : (newAssetUser || 'ส่วนกลาง'),
          position: normalizeAssetStatus(newAssetStatus) === 'ว่าง' ? '-' : (newAssetPosition || '-'),
          itemType: newAssetItemType,
          additionalEquipment: newAssetAdditionalEquipment,
          deviceSerial: newAssetSerial || '-',
          status: normalizeAssetStatus(newAssetStatus),
          notes: newAssetNotes,
          submittedOn: newAssetSubmittedOn,
          respondent: newAssetRespondent,
          date: newAssetDate,
          softwareApp: newAssetSoftwareApp,
          registeredEmail: newAssetRegisteredEmail,
          additionalSerial: newAssetAdditionalSerial,
          returnDueDate: newAssetReturnDueDate,
          auditDate: newAssetAuditDate,
        purchaseDate: newAssetPurchaseDate,
        productionYear: newAssetProductionYear,
        warrantyExpiry: newAssetWarrantyExpiry,
          cost: newAssetCost,
          marketModel: newAssetMarketModel,
          marketPrice: Number(newAssetMarketPrice) || 0,
          priceAvailability: newAssetPriceAvailability,
          priceSourceUrl: newAssetPriceSourceUrl,
          priceCheckedAt: newAssetPriceCheckedAt
        } : asset);

        dataToSave = {
          ...data,
          [consoleMonth]: {
            ...data[consoleMonth],
            totalAssets: assetsToSave.length,
            assetsBroken: assetsToSave.filter(asset => ['รอซ่อม', 'ชำรุด'].includes(normalizeAssetStatus(asset.status))).length,
            assetsLost: assetsToSave.filter(asset => normalizeAssetStatus(asset.status) === 'สูญหาย').length,
            assetsVacant: assetsToSave.filter(asset => normalizeAssetStatus(asset.status) === 'ว่าง').length
          }
        };
      }

      // Persist the edited asset first. This also reconciles any active issue/
      // return workflow before the full dashboard snapshot is synchronized.
      if (editingAssetSn !== null && newAssetItemType && pendingAssetPatch) {
        await syncQueueRef.current.catch(() => undefined);
        const assetResponse = await authFetch(`${API_BASE}/api/assets/${editingAssetSn}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingAssetPatch)
        });
        const assetResult = await assetResponse.json();
        if (!assetResponse.ok) throw new Error(assetResult.error || 'แก้ไขสถานะทรัพย์สินไม่สำเร็จ');
      }
      await syncStateToDb(dataToSave, assetsToSave);
      const response = await authFetch(`${API_BASE}/api/db-state`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`API server returned ${response.status}`);
      const synchronized = await response.json();
      if (synchronized.data) setData(synchronized.data);
      if (synchronized.assetsList) setAssetsList(synchronized.assetsList);
      setCurrentMonth(consoleMonth);
      if (editingAssetSn !== null) {
        setEditingAssetSn(null);
        setEditingAssetTagField(null);
        setNewAssetUser('');
        setNewAssetPosition('');
        setNewAssetItemType('');
        setNewAssetAdditionalEquipment('');
        setNewAssetSerial('');
        setNewAssetStatus('ใช้งาน');
        setNewAssetNotes('');
        setNewAssetSubmittedOn('');
        setNewAssetRespondent('');
        setNewAssetDate('');
        setNewAssetSoftwareApp('');
        setNewAssetRegisteredEmail('');
        setNewAssetAdditionalSerial('');
        setNewAssetReturnDueDate('');
        setNewAssetAuditDate('');
        setNewAssetPurchaseDate('');
        setNewAssetProductionYear('');
        setNewAssetWarrantyExpiry('');
        setNewAssetCost('');
      }
      setConsoleSaveMessage('บันทึกสำเร็จและอัปเดตแดชบอร์ดแล้ว');
    } catch (error) {
      console.error('Failed to save console changes:', error);
      const databaseUnavailable = [500, 502, 503].includes(Number(error?.status)) ||
        /500|502|503|internal server error|database|connection|เชื่อมต่อ/i.test(String(error?.message || ''));
      if (databaseUnavailable && editingAssetSn !== null && pendingAssetPatch) {
        localStorage.setItem('it_dashboard_pending_sync', JSON.stringify({
          type: 'asset_patch',
          sn: editingAssetSn,
          payload: pendingAssetPatch,
          savedAt: new Date().toISOString()
        }));
        setData(dataToSave);
        setAssetsList(assetsToSave);
        if (editingAssetSn !== null) handleCancelEditAsset();
        setConsoleSaveMessage('บันทึกหมายเหตุไว้ในเครื่องแล้ว และจะซิงค์ขึ้นฐานข้อมูลอัตโนมัติเมื่อระบบพร้อม');
      } else if (databaseUnavailable) {
        setConsoleSaveMessage('ยังไม่บันทึก: ฐานข้อมูลไม่พร้อมใช้งาน กรุณาตรวจสอบ Render PostgreSQL แล้วลองใหม่');
      } else {
        setConsoleSaveMessage(`บันทึกไม่สำเร็จ: ${error?.message || 'กรุณาลองใหม่'}`);
      }
    } finally {
      isPendingSyncRef.current = false;
      setConsoleSaving(false);
    }
  };

  useEffect(() => {
    if (!data[currentMonth] && data[fallbackMonthKey]) setCurrentMonth(fallbackMonthKey);
  }, [currentMonth, data, fallbackMonthKey]);

  const mainAssetCategories = [
    { label: 'PC', usefulLifeYears: 3, match: (type) => /computer\s*\(pc\)|\bpc\b/i.test(type) },
    { label: 'Notebook', usefulLifeYears: 3, match: (type) => /notebook/i.test(type) },
    { label: 'iMac', match: (type) => /imac/i.test(type) },
    { label: 'iPhone', match: (type) => /iphone/i.test(type) },
    { label: 'iPad', match: (type) => /ipad/i.test(type) },
  ];

  // One registry row may contain more than one primary-device tag. Expand it
  // into category entries so the total always equals the five visible counters.
  const primaryAssetEntries = assetsList.flatMap((asset) => {
    const type = String(asset.itemType || '');
    return mainAssetCategories
      .filter((category) => category.match(type))
      .map((category) => ({ asset, category }));
  });
  const mainAssetBreakdown = mainAssetCategories.map((category) => ({
    label: category.label,
    count: primaryAssetEntries.filter((entry) => entry.category.label === category.label).length,
  }));

  // Status cards represent the complete registry, including printers, CCTV,
  // accessories and any future categories—not only the five headline types.
  const warehouseTotalCount = assetsList.length;
  const vacantStockCount = assetsList.filter((asset) => normalizeAssetStatus(asset.status) === 'ว่าง').length;
  const warehouseBrokenCount = assetsList.filter((asset) => ['รอซ่อม', 'ชำรุด'].includes(normalizeAssetStatus(asset.status))).length;
  const warehouseLostCount = assetsList.filter((asset) => normalizeAssetStatus(asset.status) === 'สูญหาย').length;
  const pricedAssets = assetsList.filter((asset) => Number(asset.marketPrice) > 0 && normalizeAssetStatus(asset.status) !== 'สูญหาย');
  const calculatedAssetValue = pricedAssets.reduce((sum, asset) => sum + Number(asset.marketPrice || 0), 0);
  const primaryVacantStockEntries = primaryAssetEntries.filter(({ asset }) => normalizeAssetStatus(asset.status) === 'ว่าง');
  const vacantStockBreakdown = Array.from(primaryVacantStockEntries.reduce((groups, entry) => {
    const label = entry.category.label;
    groups.set(label, (groups.get(label) || 0) + 1);
    return groups;
  }, new Map()), ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'th'));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nearExpiryLimit = new Date(today);
  nearExpiryLimit.setFullYear(nearExpiryLimit.getFullYear() + 1);

  const normalizeProductionYear = (value) => {
    const matchedYear = String(value || '').match(/\d{4}/)?.[0];
    if (!matchedYear) return null;
    const year = Number(matchedYear);
    const christianYear = year > 2400 ? year - 543 : year;
    return christianYear >= 1900 && christianYear <= 2200 ? christianYear : null;
  };
  const primaryExpiringAssetDetails = primaryAssetEntries.flatMap(({ asset, category }) => {
    if (!category.usefulLifeYears || normalizeAssetStatus(asset.status) === 'สูญหาย') return [];
    const productionYear = normalizeProductionYear(asset.productionYear);
    if (!productionYear) return [];
    const modelExpiryDate = new Date(productionYear + category.usefulLifeYears, 11, 31);
    if (modelExpiryDate < today || modelExpiryDate > nearExpiryLimit) return [];
    return [{
      id: asset.deviceSerial || asset.sn,
      type: category.label,
      model: asset.itemType || category.label,
      dept: asset.position || '-',
      productionYear,
      expDate: modelExpiryDate.toLocaleDateString('th-TH'),
    }];
  });
  const primaryExpiringAssets = primaryExpiringAssetDetails.length;

  const detailedSoftwareLicenses = (activeData?.softwareExpiringDetails || []).filter((item) => item.isLicenseRecord);
  const detailedLicensesInUse = detailedSoftwareLicenses.reduce((sum, item) => sum + Number(item.used || 0), 0);
  const detailedLicensesVacant = detailedSoftwareLicenses.reduce((sum, item) => sum + Number(item.vacant || 0), 0);
  const isAnnualSoftwareCost = (item) => {
    const paymentSchedule = String(item.paymentDate || item.billingCycle || '').trim().toLocaleLowerCase('th-TH');
    if (/รายเดือน|monthly|month/.test(paymentSchedule)) return false;
    return /รายปี|annual|yearly|year/.test(paymentSchedule) || /\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}/.test(paymentSchedule);
  };
  const filteredSoftwareLicenses = (activeData?.softwareExpiringDetails || [])
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => {
      const normalizedSearch = softwareSearch.trim().toLocaleLowerCase('th-TH');
      const matchesSearch = !normalizedSearch || [
        item.name,
        item.owner,
        item.paymentChannel,
        item.paymentDate,
        item.expiringDate,
        item.registeredEmail,
        item.currentUsers,
      ].some((value) => String(value || '').toLocaleLowerCase('th-TH').includes(normalizedSearch));
      const annual = isAnnualSoftwareCost(item);
      const matchesBilling = softwareBillingFilter === 'all' ||
        (softwareBillingFilter === 'monthly' && !annual) ||
        (softwareBillingFilter === 'yearly' && annual);
      return matchesSearch && matchesBilling;
    });
  const filteredSoftwareTotalCost = filteredSoftwareLicenses.reduce(
    (sum, { item }) => sum + Number(item.monthlyCost ?? item.price ?? 0),
    0,
  );
  const detailedMonthlySoftwareCost = detailedSoftwareLicenses.reduce((sum, item) =>
    sum + (isAnnualSoftwareCost(item) ? 0 : Number(item.monthlyCost ?? item.price ?? 0)), 0);
  const detailedAnnualSoftwareCost = detailedSoftwareLicenses.reduce((sum, item) =>
    sum + (isAnnualSoftwareCost(item) ? Number(item.monthlyCost ?? item.price ?? 0) : 0), 0);
  // Usage and vacancy are actual totals from every row in the License registry.
  const calculatedLicensesInUse = detailedLicensesInUse;
  const calculatedLicensesVacant = detailedLicensesVacant;
  const calculatedSoftwareCost = detailedMonthlySoftwareCost;
  const calculatedSoftwareAnnualCost = detailedAnnualSoftwareCost;
  const calculatedTotalSoftware = Number(activeData?.totalSoftware || 0);

  const resetSoftwareForm = () => {
    setEditingSoftwareIndex(null);
    setSoftwareName('');
    setSoftwareUsed('0');
    setSoftwareVacant('0');
    setSoftwareExpiryDate('');
    setSoftwareMonthlyCost('0');
    setSoftwareOwner('');
    setSoftwarePaymentChannel('');
    setSoftwarePaymentDate('');
    setSoftwareRegisteredEmail('');
    setSoftwareCurrentUsers('');
  };

  const saveSoftwareLicense = (event) => {
    event.preventDefault();
    const license = {
      name: softwareName.trim(),
      used: Number(softwareUsed || 0),
      vacant: Number(softwareVacant || 0),
      licenses: Number(softwareUsed || 0) + Number(softwareVacant || 0),
      expiringDate: softwareExpiryDate,
      monthlyCost: Number(softwareMonthlyCost || 0),
      price: Number(softwareMonthlyCost || 0),
      owner: softwareOwner.trim(),
      paymentChannel: softwarePaymentChannel.trim(),
      paymentDate: softwarePaymentDate.trim(),
      registeredEmail: softwareRegisteredEmail.trim(),
      currentUsers: softwareCurrentUsers.trim(),
      status: 'ใช้งาน',
      isLicenseRecord: true,
    };
    if (!license.name) return;

    setData((previous) => {
      const monthData = previous[currentMonth] || { ...initialDashboardData['2026-07'] };
      const rows = [...(monthData.softwareExpiringDetails || [])];
      if (editingSoftwareIndex === null) rows.push(license);
      else rows[editingSoftwareIndex] = license;
      return {
        ...previous,
        [currentMonth]: { ...monthData, softwareExpiringDetails: rows },
      };
    });
    resetSoftwareForm();
  };

  const editSoftwareLicense = (item, index) => {
    setSoftwareFormExpanded(true);
    setEditingSoftwareIndex(index);
    setSoftwareName(item.name || '');
    setSoftwareUsed(String(item.used ?? item.licenses ?? 0));
    setSoftwareVacant(String(item.vacant ?? 0));
    setSoftwareExpiryDate(item.expiringDate || '');
    setSoftwareMonthlyCost(String(item.monthlyCost ?? 0));
    setSoftwareOwner(item.owner || '');
    setSoftwarePaymentChannel(item.paymentChannel || '');
    setSoftwarePaymentDate(item.paymentDate || '');
    setSoftwareRegisteredEmail(item.registeredEmail || '');
    setSoftwareCurrentUsers(item.currentUsers || '');
  };

  const deleteSoftwareLicense = (index) => {
    if (!window.confirm('ต้องการลบรายละเอียด License นี้ใช่หรือไม่?')) return;
    setData((previous) => {
      const monthData = previous[currentMonth] || { ...initialDashboardData['2026-07'] };
      const currentList = monthData.softwareExpiringDetails || [];
      return {
        ...previous,
        [currentMonth]: {
          ...monthData,
          softwareExpiringDetails: currentList.filter((_, rowIndex) => rowIndex !== index),
        },
      };
    });
    resetSoftwareForm();
  };

  const importSoftwareLicensesFromExcel = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const workbook = XLSX.read(loadEvent.target.result, { type: 'array', cellDates: true });
        const normalizeHeader = (value) => String(value ?? '')
          .normalize('NFKC')
          .toLocaleLowerCase('th-TH')
          .replace(/[^\p{L}\p{N}]+/gu, '');
        const aliases = {
          name: ['ชื่อซอฟต์แวร์โปรแกรม', 'ชื่อซอฟต์แวร์', 'ชื่อโปรแกรม', 'โปรแกรม', 'ระบบ', 'softwareprogram', 'softwarename', 'software', 'programname', 'program', 'application', 'appname', 'service'],
          owner: ['owner', 'ownerแผนก', 'เจ้าของ', 'ผู้รับผิดชอบ', 'แผนก', 'department', 'vendor', 'ผู้ให้บริการ'],
          used: ['ใช้งาน', 'licenseใช้งาน', 'จำนวนใช้งาน', 'licenseused', 'used', 'activeusers', 'จำนวนผู้ใช้'],
          vacant: ['ว่าง', 'licenseว่าง', 'จำนวนว่าง', 'licensevacant', 'vacant', 'available', 'unused'],
          licenses: ['licenseรวม', 'จำนวนlicense', 'จำนวนสิทธิ์', 'จำนวนบัญชี', 'licenses', 'quantity', 'qty', 'seats'],
          cost: ['ราคา', 'ค่าใช้จ่ายต่อเดือนบาท', 'ค่าบริการรายเดือน', 'ค่าใช้จ่าย', 'มูลค่า', 'monthlycost', 'cost', 'price', 'amount', 'fee'],
          paymentChannel: ['ช่องทางชำระ', 'ช่องทางชำระเงิน', 'วิธีชำระ', 'paymentchannel', 'paymentmethod', 'paymentvia'],
          paymentDate: ['วันที่ชำระ', 'วันที่รอบชำระเงิน', 'รอบชำระเงิน', 'ความถี่ชำระ', 'billingcycle', 'paymentdate', 'paymentcycle', 'frequency'],
          expiryDate: ['วันหมดสัญญา', 'วันหมดอายุ', 'วันต่ออายุ', 'ครบกำหนด', 'expirydate', 'expirationdate', 'renewaldate', 'duedate', 'enddate'],
          email: ['อีเมลสมัคร', 'อีเมลที่สมัคร', 'อีเมล', 'บัญชี', 'registeredemail', 'email', 'account', 'username'],
          users: ['ผู้ใช้งานปัจจุบัน', 'รายชื่อผู้ใช้งาน', 'ผู้ใช้งาน', 'currentusers', 'users', 'assignee', 'assignedto'],
          status: ['สถานะ', 'status', 'contractstatus', 'licensestatus'],
        };
        const normalizedAliases = Object.fromEntries(Object.entries(aliases).map(([key, values]) => [key, values.map(normalizeHeader)]));
        const matchesAlias = (header, values) => Boolean(header) && values.some((alias) => header === alias || (header.length >= 3 && alias.length >= 3 && (header.includes(alias) || alias.includes(header))));
        let tableRows = null;
        let headerRowIndex = -1;
        let selectedSheetName = '';
        let bestHeaderScore = 0;

        for (const sheetName of workbook.SheetNames) {
          const candidateRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '', raw: true });
          candidateRows.slice(0, 50).forEach((row, rowIndex) => {
            const normalizedRow = row.map(normalizeHeader);
            const hasName = normalizedRow.some(header => matchesAlias(header, normalizedAliases.name));
            if (!hasName) return;
            const score = Object.values(normalizedAliases).reduce((total, fieldAliases) => total + (normalizedRow.some(header => matchesAlias(header, fieldAliases)) ? 1 : 0), 0);
            if (score <= bestHeaderScore) return;
            bestHeaderScore = score;
            tableRows = candidateRows;
            headerRowIndex = rowIndex;
            selectedSheetName = sheetName;
          });
        }

        if (!tableRows || headerRowIndex === -1) {
          throw new Error('ไม่พบคอลัมน์ Program/ชื่อโปรแกรม กรุณาตรวจสอบว่าไฟล์มีแถวหัวตารางและข้อมูลอย่างน้อย 1 รายการ');
        }

        const headers = tableRows[headerRowIndex].map(normalizeHeader);
        const findColumn = (field) => {
          const fieldAliases = normalizedAliases[field];
          let bestIndex = -1;
          let bestScore = 0;

          headers.forEach((header, index) => {
            if (!header) return;
            fieldAliases.forEach((alias) => {
              let score = 0;
              if (header === alias) score = 1000 + alias.length;
              else if (header.length >= 3 && alias.length >= 3 && header.includes(alias)) score = 500 + alias.length;
              else if (header.length >= 3 && alias.length >= 3 && alias.includes(header)) score = 100 + header.length;

              if (score > bestScore) {
                bestScore = score;
                bestIndex = index;
              }
            });
          });

          return bestIndex;
        };
        const columns = {
          name: findColumn('name'), owner: findColumn('owner'), used: findColumn('used'), vacant: findColumn('vacant'), licenses: findColumn('licenses'),
          cost: findColumn('cost'), paymentChannel: findColumn('paymentChannel'), paymentDate: findColumn('paymentDate'), expiryDate: findColumn('expiryDate'),
          email: findColumn('email'), users: findColumn('users'), status: findColumn('status'),
        };
        const valueAt = (row, columnIndex) => columnIndex >= 0 ? row[columnIndex] : '';
        const hasValue = (value) => value !== '' && value !== null && value !== undefined;
        const toNumber = (value) => {
          if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
          const cleaned = String(value ?? '').replace(/,/g, '').replace(/[^0-9.-]/g, '');
          return Number(cleaned) || 0;
        };
        const toDateText = (value) => {
          if (!hasValue(value)) return '';
          if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
          if (typeof value === 'number') {
            const parsed = XLSX.SSF.parse_date_code(value);
            if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
          }
          return String(value).trim();
        };

        const importedLicenses = tableRows.slice(headerRowIndex + 1).map((row) => {
          const name = String(valueAt(row, columns.name)).trim();
          const used = toNumber(valueAt(row, columns.used));
          const vacant = toNumber(valueAt(row, columns.vacant));
          const totalLicenses = toNumber(valueAt(row, columns.licenses));
          const monthlyCost = toNumber(valueAt(row, columns.cost));
          return {
            name,
            owner: String(valueAt(row, columns.owner)).trim(),
            used: columns.used >= 0 ? used : totalLicenses,
            vacant,
            licenses: columns.used >= 0 || columns.vacant >= 0 ? used + vacant : totalLicenses,
            monthlyCost,
            price: monthlyCost,
            paymentChannel: String(valueAt(row, columns.paymentChannel)).trim(),
            paymentDate: String(valueAt(row, columns.paymentDate)).trim(),
            expiringDate: toDateText(valueAt(row, columns.expiryDate)),
            registeredEmail: String(valueAt(row, columns.email)).trim(),
            currentUsers: String(valueAt(row, columns.users)).trim(),
            status: String(valueAt(row, columns.status)).trim() || 'ใช้งาน',
            isLicenseRecord: true,
            _importedColumns: columns,
          };
        }).filter((item) => item.name && !/^(รวม|total|subtotal|grandtotal)$/i.test(normalizeHeader(item.name)));

        if (importedLicenses.length === 0) {
          throw new Error(`พบหัวตารางในชีต “${selectedSheetName}” แต่ไม่มีข้อมูลใต้คอลัมน์ Program/ชื่อโปรแกรม`);
        }

        setData((previous) => {
          const monthData = previous[currentMonth] || { ...initialDashboardData['2026-07'] };
          const existingRows = [...(monthData.softwareExpiringDetails || [])];
          const importKey = (item) => `${normalizeHeader(item.name)}::${normalizeHeader(item.registeredEmail)}`;
          const importedByKey = new Map(importedLicenses.map((item) => [importKey(item), item]));
          const mergedRows = existingRows
            .map((existing) => {
              const existingKey = importKey(existing);
              const imported = importedByKey.get(existingKey);
              if (!imported) return existing;
              importedByKey.delete(existingKey);
              const next = { ...existing, name: imported.name, isLicenseRecord: true };
              Object.entries(imported._importedColumns).forEach(([field, columnIndex]) => {
                if (columnIndex < 0) return;
                const targetField = { cost: 'monthlyCost', expiryDate: 'expiringDate', email: 'registeredEmail', users: 'currentUsers' }[field] || field;
                if (targetField === 'licenses') return;
                next[targetField] = imported[targetField];
              });
              if (imported._importedColumns.licenses >= 0 && imported._importedColumns.used < 0) {
                next.used = imported.used;
                if (imported._importedColumns.vacant < 0) next.vacant = 0;
              }
              next.licenses = Number(next.used || 0) + Number(next.vacant || 0);
              next.price = Number(next.monthlyCost || 0);
              return next;
            })
            .concat(Array.from(importedByKey.values()).map(({ _importedColumns, ...item }) => item));
          return {
            ...previous,
            [currentMonth]: { ...monthData, softwareExpiringDetails: mergedRows },
          };
        });
        const recognizedFields = Object.entries(columns).filter(([, index]) => index >= 0).map(([field]) => field).length;
        alert(`นำเข้า License สำเร็จ ${importedLicenses.length} รายการ จากชีต “${selectedSheetName}” (จับคู่ได้ ${recognizedFields} คอลัมน์)`);
      } catch (error) {
        alert(`นำเข้าไฟล์ Excel ไม่สำเร็จ: ${error.message}`);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Helper currency formatter
  const formatThaiBaht = (value) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value);
  };

  // Re-render Chart.js graphs whenever activeData updates
  useEffect(() => {
    if (!activeData) return;

    // --- CHART 1: ASSETS (Doughnut) ---
    if (assetCanvasRef.current) {
      if (assetChartInst.current) assetChartInst.current.destroy();

      const normalAssets = Math.max(
        0,
        warehouseTotalCount - warehouseBrokenCount - warehouseLostCount - primaryExpiringAssets
      );
      const ctx = assetCanvasRef.current.getContext('2d');
      assetChartInst.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['ปกติ', 'ใกล้หมดอายุ', 'ชำรุด', 'สูญหาย'],
          datasets: [{
            data: [normalAssets, primaryExpiringAssets, warehouseBrokenCount, warehouseLostCount],
            backgroundColor: [
              'rgba(16, 185, 129, 0.7)',
              'rgba(245, 158, 11, 0.7)',
              'rgba(239, 68, 68, 0.7)',
              'rgba(156, 163, 175, 0.7)'
            ],
            borderColor: ['#10b981', '#f59e0b', '#ef4444', '#9ca3af'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#e5e7eb',
                font: { size: 9, family: 'Sarabun' }
              }
            }
          },
          cutout: '70%'
        }
      });
    }

    // --- CHART 2: SOFTWARE LICENSES (Stacked horizontal bar) ---
    if (softwareCanvasRef.current) {
      if (softwareChartInst.current) softwareChartInst.current.destroy();

      const ctx = softwareCanvasRef.current.getContext('2d');
      softwareChartInst.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['สิทธิ์ใช้งาน (Licenses)'],
          datasets: [
            {
              label: 'ใช้งานอยู่ (In Use)',
              data: [calculatedLicensesInUse],
              backgroundColor: 'rgba(59, 130, 246, 0.75)',
              borderColor: '#3b82f6',
              borderWidth: 1
            },
            {
              label: 'ว่าง (Vacant)',
              data: [calculatedLicensesVacant],
              backgroundColor: 'rgba(6, 182, 212, 0.75)',
              borderColor: '#06b6d4',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: {
              stacked: true,
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#9ca3af', font: { size: 8 } }
            },
            y: {
              stacked: true,
              grid: { display: false },
              ticks: { color: '#9ca3af', font: { size: 9, family: 'Sarabun' } }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#e5e7eb',
                boxWidth: 12,
                font: { size: 9, family: 'Sarabun' }
              }
            }
          }
        }
      });
    }

    // --- CHART 3: REPAIRS BY DEPT (Horizontal bar) ---
    if (repairCanvasRef.current) {
      if (repairChartInst.current) repairChartInst.current.destroy();

      const ctx = repairCanvasRef.current.getContext('2d');
      const depts = Object.keys(activeData.deptCosts);
      const values = Object.values(activeData.deptCosts);

      repairChartInst.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: depts,
          datasets: [{
            label: 'ค่าใช้จ่ายซ่อม (บาท)',
            data: values,
            backgroundColor: 'rgba(245, 158, 11, 0.7)',
            borderColor: '#f59e0b',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#9ca3af', font: { size: 8 } }
            },
            y: {
              grid: { display: false },
              ticks: { color: '#e5e7eb', font: { size: 9, family: 'Sarabun' } }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // Cleanup chart instances on unmount/re-render
    return () => {
      if (assetChartInst.current) assetChartInst.current.destroy();
      if (softwareChartInst.current) softwareChartInst.current.destroy();
      if (repairChartInst.current) repairChartInst.current.destroy();
    };
  }, [
    activeData,
    primaryExpiringAssets,
    calculatedLicensesInUse,
    calculatedLicensesVacant,
    warehouseTotalCount,
    warehouseBrokenCount,
    warehouseLostCount
  ]);

  // ========================================
  // XLSX IMPORT / EXPORT / TEMPLATE FUNCTIONS
  // ========================================

  // Define the field mapping for the main "Dashboard" sheet
  const FIELD_MAP = [
    { key: 'monthName', header: 'เดือน (Month Name)', example: 'กรกฎาคม 2026' },
    { key: 'monthKey', header: 'รหัสเดือน (Month Key, เช่น 2026-07)', example: '2026-07' },
    // Asset
    { key: 'totalAssets', header: 'จำนวนอุปกรณ์ทั้งหมด', example: 1450 },
    { key: 'assetValue', header: 'มูลค่าทรัพย์สิน IT (บาท)', example: 85200000 },
    { key: 'assetsExpiring', header: 'อุปกรณ์ใกล้หมดอายุ', example: 38 },
    { key: 'assetsBroken', header: 'อุปกรณ์ชำรุด', example: 8 },
    { key: 'assetsLost', header: 'อุปกรณ์สูญหาย', example: 1 },
    // Support
    { key: 'ticketsCount', header: 'จำนวน Ticket', example: 280 },
    { key: 'slaPercent', header: 'SLA Compliance (%)', example: 98.8 },
    { key: 'responseTime', header: 'Response Time เฉลี่ย (นาที)', example: 8 },
    { key: 'resolutionTime', header: 'Resolution Time เฉลี่ย (ชม.)', example: 1.8 },
    { key: 'csat', header: 'CSAT คะแนนความพึงพอใจ (จาก 5)', example: 4.9 },
    // Software
    { key: 'totalSoftware', header: 'โปรแกรมทั้งหมด', example: 45 },
    { key: 'licensesInUse', header: 'License ใช้งาน', example: 2450 },
    { key: 'licensesVacant', header: 'License ว่าง', example: 350 },
    { key: 'softwareCost', header: 'ค่าใช้จ่าย Software (บาท/เดือน)', example: 1280000 },
    { key: 'softwareAnnualCost', header: 'ค่าใช้จ่าย Software (บาท/ปี)', example: 2500000 },
    { key: 'softwareExpiring', header: 'โปรแกรมใกล้หมดอายุ', example: 3 },
    // Security
    { key: 'backupSuccess', header: 'Backup สำเร็จ (%)', example: 99.98 },
    { key: 'securityIncidents', header: 'Security Incident (ครั้ง)', example: 0 },
    { key: 'antivirusCoverage', header: 'Antivirus Coverage (%)', example: 100 },
    { key: 'mfaCoverage', header: 'MFA Coverage (%)', example: 100 },
    // Repair
    { key: 'repairCount', header: 'จำนวนการซ่อม', example: 12 },
    { key: 'repairCost', header: 'ค่าใช้จ่ายการซ่อม (บาท)', example: 145000 },
    // Improvement
    { key: 'automationsDone', header: 'Automation ที่ทำเสร็จ', example: 5 },
    { key: 'aiApps', header: 'AI ที่นำมาใช้', example: 4 },
    { key: 'hoursSaved', header: 'ชั่วโมงที่ลดลงจาก Automation', example: 320 },
  ];

  // Download a blank .xlsx template
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Dashboard Data (main metrics)
    const dashHeaders = FIELD_MAP.map(f => f.header);
    const dashExamples = FIELD_MAP.map(f => f.example);
    const dashWs = XLSX.utils.aoa_to_sheet([dashHeaders, dashExamples]);
    // Set column widths
    dashWs['!cols'] = dashHeaders.map(h => ({ wch: Math.max(h.length + 4, 18) }));
    XLSX.utils.book_append_sheet(wb, dashWs, 'Dashboard');

    // Sheet 2: Top 10 อุปกรณ์เสียบ่อย
    const repairHeaders = ['รหัสเดือน (Month Key)', 'ชื่ออุปกรณ์', 'จำนวนครั้งที่เสีย', 'ค่าใช้จ่ายซ่อม (บาท)'];
    const repairExample = ['2026-07', 'Google TPU v5e Node', 4, 80000];
    const repairWs = XLSX.utils.aoa_to_sheet([repairHeaders, repairExample]);
    repairWs['!cols'] = repairHeaders.map(h => ({ wch: Math.max(h.length + 4, 18) }));
    XLSX.utils.book_append_sheet(wb, repairWs, 'Top10 อุปกรณ์เสียบ่อย');

    // Sheet 3: ค่าใช้จ่ายต่อแผนก
    const deptHeaders = ['รหัสเดือน (Month Key)', 'ชื่อแผนก', 'ค่าใช้จ่ายซ่อม (บาท)'];
    const deptExample = ['2026-07', 'AI Research', 85000];
    const deptWs = XLSX.utils.aoa_to_sheet([deptHeaders, deptExample]);
    deptWs['!cols'] = deptHeaders.map(h => ({ wch: Math.max(h.length + 4, 18) }));
    XLSX.utils.book_append_sheet(wb, deptWs, 'ค่าใช้จ่ายต่อแผนก');

    // Sheet 4: โครงการที่กำลังดำเนินการ
    const projHeaders = ['รหัสเดือน (Month Key)', 'ชื่อโครงการ', 'รายละเอียดความคืบหน้า'];
    const projExample = ['2026-07', 'Gemini Auto-IT Agent', 'นำโมเดล Gemini มาช่วยตอบและแก้ปัญหาไอที คืบหน้า 85%'];
    const projWs = XLSX.utils.aoa_to_sheet([projHeaders, projExample]);
    projWs['!cols'] = projHeaders.map(h => ({ wch: Math.max(h.length + 4, 25) }));
    XLSX.utils.book_append_sheet(wb, projWs, 'โครงการดำเนินการ');

    // Sheet 5: Recommendation
    const recHeaders = ['รหัสเดือน (Month Key)', 'ข้อเสนอแนะ'];
    const recExample = ['2026-07', 'แนะนำจัดทำแผนงบประมาณเพื่อเปลี่ยนผ่านจาก TPU v4 Nodes'];
    const recWs = XLSX.utils.aoa_to_sheet([recHeaders, recExample]);
    recWs['!cols'] = recHeaders.map(h => ({ wch: Math.max(h.length + 4, 40) }));
    XLSX.utils.book_append_sheet(wb, recWs, 'Recommendation');

    // Sheet 6: อุปกรณ์ใกล้หมดอายุ (Expiring Assets Details)
    const expAssetHeaders = ['รหัสเดือน (Month Key)', 'รหัสทรัพย์สิน', 'ประเภท', 'รุ่น/โมเดล', 'แผนก', 'วันที่หมดอายุ'];
    const expAssetExample = ['2026-07', 'AST-TPU-042', 'Server Node', 'Google TPU v4 Node', 'AI Research', '10 ส.ค. 2026'];
    const expAssetWs = XLSX.utils.aoa_to_sheet([expAssetHeaders, expAssetExample]);
    expAssetWs['!cols'] = expAssetHeaders.map(h => ({ wch: Math.max(h.length + 4, 20) }));
    XLSX.utils.book_append_sheet(wb, expAssetWs, 'อุปกรณ์ใกล้หมดอายุ');

    // Sheet 7: โปรแกรมใกล้หมดอายุ (Expiring Software Details)
    const expSwHeaders = ['รหัสเดือน (Month Key)', 'ชื่อซอฟต์แวร์', 'จำนวน Licenses', 'วันหมดสัญญา', 'สถานะ'];
    const expSwExample = ['2026-07', 'Google Cloud Platform', 500, '15 ส.ค. 2026', 'ใกล้หมดอายุ'];
    const expSwWs = XLSX.utils.aoa_to_sheet([expSwHeaders, expSwExample]);
    expSwWs['!cols'] = expSwHeaders.map(h => ({ wch: Math.max(h.length + 4, 22) }));
    XLSX.utils.book_append_sheet(wb, expSwWs, 'โปรแกรมใกล้หมดอายุ');

    XLSX.writeFile(wb, 'IT_Dashboard_Template.xlsx');
  };

  const exportAssetsToExcel = (assetsToExport, monthToExport) => {
    if (!assetsToExport || assetsToExport.length === 0) {
      alert('ไม่มีข้อมูลสำหรับ Export');
      return;
    }
    const wb = XLSX.utils.book_new();
    const headers = ['Number', 'วันที่ Submit', 'ผู้รับผิดชอบ', 'วันที่เบิกใช้งาน', 'ผู้เบิกใช้งาน', 'ตำแหน่ง/แผนก', 'รายการอุปกรณ์หลัก', 'อุปกรณ์เพิ่มเติม', 'ซอฟต์แวร์/App', 'อีเมลที่ลงทะเบียน', 'หมายเลขอุปกรณ์', 'หมายเลขอุปกรณ์เพิ่มเติม', 'กำหนดคืน', 'สถานะ', 'หมายเหตุ', 'วันที่ตรวจสอบ', 'วันที่ซื้อ', 'ปีที่ผลิต', 'วันหมดประกัน', 'ค่าใช้จ่าย'];
    
    const rows = assetsToExport.map((asset, idx) => [
      idx + 1,
      asset.submittedOn || '',
      asset.respondent || '',
      asset.date || '',
      asset.user || '',
      asset.position || '',
      asset.itemType || '',
      Array.isArray(asset.additionalEquipment) ? asset.additionalEquipment.join(', ') : (asset.additionalEquipment || ''),
      Array.isArray(asset.softwareApp) ? asset.softwareApp.join(', ') : (asset.softwareApp || ''),
      asset.registeredEmail || '',
      asset.deviceSerial || '',
      asset.additionalSerial || '',
      asset.returnDueDate || '',
      asset.status || '',
      asset.notes || '',
      asset.inspectionDate || '',
      asset.purchaseDate || '',
      asset.productionYear || '',
      asset.warrantyEndDate || '',
      asset.expense || ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 15) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Asset_Registry');
    XLSX.writeFile(wb, `Asset_Registry_${monthToExport}.xlsx`);
  };

  const exportAssetTemplate = () => {
    const wb = XLSX.utils.book_new();
    const headers = ['Nember', 'Submitted on', 'Respondents', 'วันที่เบิกใช้งาน', 'บุคคลเบิกใช้อุปกรณ์', 'ตำแหน่ง', 'รายการอุปกรณ์หลัก', 'อุปกรณ์เพิ่มเติมที่ต้องการเบิก', 'ซอต์ฟแวร์/ App', 'เมลที่ลงทะเบียน', 'หมายเลขอุปกรณ์ (เช่น  Ipad 016)', 'หมายเลขอุปกรณ์ เพิ่มเติม  (เช่น  สาย อะเเดปเตอร์ ipad-011))', 'กำหนดคืนอุปกรณ์', 'สถานะ', 'หมายเหตุ', 'วันที่ตรวจสอบ', 'วันที่ซื้อ', 'ปีที่ผลิต', 'วันหมดประกัน', 'ค่าใช้จ่าย'];
    const exampleRow = [1, 'YYYY-MM-DD', 'ชื่อผู้รับผิดชอบ', 'YYYY-MM-DD', 'ชื่อผู้เบิก', 'IT', 'Notebook', 'Mouse', 'Office 365', 'test@example.com', 'NB-001', 'MS-001', 'YYYY-MM-DD', 'ใช้งาน', '', '', '', 2024, '', '0'];
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 15) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `Asset_Registry_Template.xlsx`);
  };

  const resetVendorContractForm = () => {
    setVendorContractForm(emptyVendorContract);
    setEditingVendorContractIndex(null);
  };

  const saveVendorContract = (event) => {
    event.preventDefault();
    const contract = {
      ...vendorContractForm,
      amount: Number(vendorContractForm.amount || 0)
    };
    setData(previous => {
      const monthData = previous[currentMonth] || {};
      const contracts = [...(monthData.vendorContracts || [])];
      if (editingVendorContractIndex === null) contracts.push(contract);
      else contracts[editingVendorContractIndex] = contract;
      return { ...previous, [currentMonth]: { ...monthData, vendorContracts: contracts } };
    });
    resetVendorContractForm();
  };

  const editVendorContract = (contract, index) => {
    setVendorContractForm({ ...emptyVendorContract, ...contract, amount: String(contract.amount || 0) });
    setEditingVendorContractIndex(index);
  };

  const deleteVendorContract = (index) => {
    if (!window.confirm('ยืนยันการลบ Vendor Contract รายการนี้?')) return;
    setData(previous => {
      const monthData = previous[currentMonth] || {};
      return {
        ...previous,
        [currentMonth]: {
          ...monthData,
          vendorContracts: (monthData.vendorContracts || []).filter((_, itemIndex) => itemIndex !== index)
        }
      };
    });
    if (editingVendorContractIndex === index) resetVendorContractForm();
  };

  const resetProjectForm = () => {
    setProjectForm(emptyProjectForm);
    setEditingProjectIndex(null);
  };

  const withProjectMetrics = (monthData, projects) => {
    const structured = projects.filter(project => project.projectType);
    return {
      ...monthData,
      ongoingProjects: projects,
      automationsDone: structured.filter(project => project.projectType === 'Automation' && project.status === 'เสร็จสิ้น').length,
      aiApps: structured.filter(project => ['AI', 'AI & Infrastructure'].includes(project.projectType) && project.status !== 'ยกเลิก').length,
      hoursSaved: structured.reduce((sum, project) => sum + Number(project.hoursSaved || 0), 0),
    };
  };

  const saveProject = (event) => {
    event.preventDefault();
    const project = {
      ...projectForm,
      progress: Math.min(100, Math.max(0, Number(projectForm.progress || 0))),
      hoursSaved: Math.max(0, Number(projectForm.hoursSaved || 0)),
    };
    setData(previous => {
      const monthData = previous[currentMonth] || {};
      const projects = [...(monthData.ongoingProjects || [])];
      if (editingProjectIndex === null) projects.push(project);
      else projects[editingProjectIndex] = project;
      return { ...previous, [currentMonth]: withProjectMetrics(monthData, projects) };
    });
    resetProjectForm();
  };

  const editProject = (project, index) => {
    setProjectForm({
      ...emptyProjectForm,
      ...project,
      progress: String(project.progress || 0),
      hoursSaved: String(project.hoursSaved || 0),
    });
    setEditingProjectIndex(index);
  };

  const deleteProject = (index) => {
    if (!window.confirm('ยืนยันการลบโปรเจกต์รายการนี้?')) return;
    setData(previous => {
      const monthData = previous[currentMonth] || {};
      const projects = (monthData.ongoingProjects || []).filter((_, itemIndex) => itemIndex !== index);
      return { ...previous, [currentMonth]: withProjectMetrics(monthData, projects) };
    });
    if (editingProjectIndex === index) resetProjectForm();
  };

  // Export current data to .xlsx
  const exportToXlsx = async () => {
    let wb;
    try {
      const templateResponse = await fetch('/weekly-it-data-report-new.xlsx', { cache: 'no-store' });
      if (!templateResponse.ok) throw new Error(`Template ${templateResponse.status}`);
      wb = XLSX.read(await templateResponse.arrayBuffer(), { type: 'array', cellStyles: true });
    } catch (error) {
      console.error('Unable to load weekly export template:', error);
      alert('ไม่สามารถโหลดแม่แบบ Weekly IT Report ได้');
      return;
    }

    const writeTemplateCell = (sheetName, address, value) => {
      const sheet = wb.Sheets[sheetName];
      if (!sheet) return;
      const current = sheet[address] || {};
      const type = typeof value === 'number' ? 'n' : 's';
      sheet[address] = { ...current, t: type, v: value ?? '' };
      delete sheet[address].f;
    };
    const checkedDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const returnRowsForReport = assetRequests.filter(request => ['return_requested', 'returned'].includes(request.status));
    const incidentRowsForReport = assetRequests.filter(request => request.workflow_type === 'replacement' || ['ชำรุด', 'สูญหาย'].includes(request.return_condition));
    const brokenAssetsForReport = assetsList.filter(asset => ['รอซ่อม', 'ชำรุด'].includes(normalizeAssetStatus(asset.status)));
    const workflowSummary = `Checklist ${assetRequests.length} รายการ; Asset Return ${returnRowsForReport.length} รายการ; Incident ${incidentRowsForReport.length} รายการ`;

    writeTemplateCell('สรุป', 'A4', `ข้อมูลตรวจสอบ ณ ${checkedDate}`);
    writeTemplateCell('สรุป', 'A7', 4);
    writeTemplateCell('สรุป', 'C7', 3);
    writeTemplateCell('สรุป', 'E7', 1);
    writeTemplateCell('สรุป', 'B11', `Dashboard พร้อมใช้งาน; ทรัพย์สิน ${warehouseTotalCount} เครื่อง; ${workflowSummary}`);
    writeTemplateCell('สรุป', 'B12', `โครงการกำลังดำเนินการ ${(activeData.ongoingProjects || []).filter(project => project.status !== 'เสร็จสิ้น').length} รายการ; โปรแกรมใกล้หมดสัญญา ${activeData.softwareExpiring || 0} โปรแกรม`);
    writeTemplateCell('สรุป', 'B13', `อุปกรณ์ชำรุด ${warehouseBrokenCount} เครื่อง; สูญหาย ${warehouseLostCount} เครื่อง; รายการรอตรวจรับ ${pendingAssetReturnCount}`);
    writeTemplateCell('สรุป', 'B17', `Dashboard และ Device Monitor เปิดใช้งานได้ ข้อมูลรายงานเดือน ${activeData.monthName}`);
    writeTemplateCell('สรุป', 'B18', `อุปกรณ์ ${monitoredTotal} เครื่อง: Active ${monitoredActive}; ใกล้ครบกำหนด ${monitoredWarning}; ยังไม่ยืนยัน ${monitoredUnverified}`);
    writeTemplateCell('สรุป', 'B19', `ทรัพย์สิน ${warehouseTotalCount} เครื่อง: ว่าง ${vacantStockCount}; ชำรุด ${warehouseBrokenCount}; สูญหาย ${warehouseLostCount}`);
    writeTemplateCell('สรุป', 'B20', `Software ${activeData.totalSoftware || 0} โปรแกรม; ค่าใช้จ่ายรายเดือน ${formatThaiBaht(activeData.softwareCost || 0)}`);
    writeTemplateCell('สรุป', 'B21', `${workflowSummary}; Vendor Contract ${(activeData.vendorContracts || []).length} สัญญา`);

    writeTemplateCell('ระบบและทรัพย์สิน', 'C6', `Dashboard แสดงอุปกรณ์ ${warehouseTotalCount} เครื่อง: ว่าง ${vacantStockCount}; ชำรุด ${warehouseBrokenCount}; สูญหาย ${warehouseLostCount}`);
    writeTemplateCell('ระบบและทรัพย์สิน', 'C7', `${monitoredTotal} อุปกรณ์; Active ${monitoredActive}; ใกล้ครบกำหนด ${monitoredWarning}; ยังไม่ยืนยัน ${monitoredUnverified}`);
    writeTemplateCell('ระบบและทรัพย์สิน', 'B13', monitoredTotal);
    writeTemplateCell('ระบบและทรัพย์สิน', 'C13', `Active ${monitoredActive}; ใกล้ครบกำหนด ${monitoredWarning}; ยังไม่ยืนยัน ${monitoredUnverified}`);
    writeTemplateCell('ระบบและทรัพย์สิน', 'B14', warehouseTotalCount);
    writeTemplateCell('ระบบและทรัพย์สิน', 'C14', `ว่าง ${vacantStockCount}; ชำรุด ${warehouseBrokenCount}; สูญหาย ${warehouseLostCount}`);
    writeTemplateCell('ระบบและทรัพย์สิน', 'B15', `ชำรุด ${warehouseBrokenCount}; สูญหาย ${warehouseLostCount}`);
    writeTemplateCell('ระบบและทรัพย์สิน', 'C15', `รอตรวจรับ ${pendingAssetReturnCount}; Incident ${incidentRowsForReport.length}; รายการชำรุด ${brokenAssetsForReport.length}`);
    writeTemplateCell('ระบบและทรัพย์สิน', 'B26', brokenAssetsForReport.length);
    writeTemplateCell('ระบบและทรัพย์สิน', 'C26', `พบอุปกรณ์ชำรุด/รอซ่อม ${brokenAssetsForReport.length} รายการ`);
    writeTemplateCell('ระบบและทรัพย์สิน', 'B29', warehouseLostCount);
    writeTemplateCell('ระบบและทรัพย์สิน', 'C29', `Dashboard แสดงยอดสูญหาย ${warehouseLostCount} เครื่อง`);

    writeTemplateCell('ข้อมูลที่ยังขาด', 'B7', workflowSummary);
    writeTemplateCell('ข้อมูลที่ยังขาด', 'C7', pendingAssetReturnCount ? `ยังมี ${pendingAssetReturnCount} รายการรอ IT ตรวจรับ` : 'ข้อมูลเบิก-คืนครบตาม Workflow ปัจจุบัน');
    writeTemplateCell('ข้อมูลที่ยังขาด', 'B8', `บัญชีบริษัท ${(activeData.softwareExpiringDetails || []).length} รายการ`);
    writeTemplateCell('ข้อมูลที่ยังขาด', 'B9', `Vendor Contract ${(activeData.vendorContracts || []).length} สัญญา`);

    const projectRowsForReport = activeData.ongoingProjects || [];
    const openProjectRowsForReport = projectRowsForReport.filter(project => project.status !== 'เสร็จสิ้น');
    const expiringSoftwareCount = Number(activeData.softwareExpiring || 0);
    const securityIncidentCount = Number(activeData.securityIncidents || 0);
    const riskRows = [
      [`อุปกรณ์ใกล้ครบกำหนด ${monitoredWarning} เครื่อง`, 'ต้องตรวจสอบสถานะอุปกรณ์ตามรอบ', monitoredWarning ? 'ต้องติดตาม' : 'ปกติ', monitoredWarning ? 'ตรวจสอบและยืนยันสถานะอุปกรณ์' : 'ไม่มีงานค้าง', 'ผู้ดูแล IT'],
      [`อุปกรณ์ยังไม่ยืนยัน ${monitoredUnverified} เครื่อง`, 'ข้อมูลผู้ถือครองอาจไม่ครบ', monitoredUnverified ? 'ต้องติดตาม' : 'ปกติ', monitoredUnverified ? 'ยืนยันผู้ใช้งานและสถานะอุปกรณ์' : 'ไม่มีงานค้าง', 'ผู้ดูแล IT'],
      [`Asset Return รอตรวจรับ ${pendingAssetReturnCount} รายการ`, 'อุปกรณ์อาจยังไม่พร้อมเบิกต่อ', pendingAssetReturnCount ? 'ต้องติดตาม' : 'ปกติ', pendingAssetReturnCount ? 'ตรวจรับและปิดรายการคืน' : 'ไม่มีงานค้าง', 'ผู้ดูแล IT'],
      [`อุปกรณ์ชำรุด ${warehouseBrokenCount} / สูญหาย ${warehouseLostCount} เครื่อง`, 'กระทบความพร้อมใช้งานและมูลค่าทรัพย์สิน', warehouseBrokenCount || warehouseLostCount ? 'ต้องติดตาม' : 'ปกติ', 'ตรวจสอบผู้รับผิดชอบ แผนซ่อม/ทดแทน และกำหนดเสร็จ', 'ผู้ดูแล IT'],
      [`Software ใกล้หมดสัญญา ${expiringSoftwareCount}; Security Incident ${securityIncidentCount}`, 'เสี่ยงต่อความต่อเนื่องของบริการและความปลอดภัย', expiringSoftwareCount || securityIncidentCount ? 'ต้องติดตาม' : 'ปกติ', expiringSoftwareCount ? 'ต่ออายุหรือยืนยันการยกเลิกโปรแกรม' : 'ติดตามตามรอบ', 'ผู้ดูแล IT']
    ];
    riskRows.forEach((values, index) => {
      const row = 6 + index;
      ['A', 'B', 'C', 'D', 'E'].forEach((column, columnIndex) => writeTemplateCell('ความเสี่ยง', `${column}${row}`, values[columnIndex]));
    });

    const handoverRows = [
      [`Dashboard มีข้อมูลทรัพย์สิน ${warehouseTotalCount} เครื่อง`, `${workflowSummary}; รอตรวจรับ ${pendingAssetReturnCount} รายการ`],
      [`Device Monitor ติดตาม ${monitoredTotal} เครื่อง`, `ใกล้ครบกำหนด ${monitoredWarning}; ยังไม่ยืนยัน ${monitoredUnverified}`],
      [`Software ${activeData.totalSoftware || 0} โปรแกรม และ Vendor ${(activeData.vendorContracts || []).length} สัญญา`, `โปรแกรมใกล้หมดสัญญา ${expiringSoftwareCount} รายการ`],
      [`โครงการทั้งหมด ${projectRowsForReport.length} รายการ`, `โครงการที่ยังดำเนินการ ${openProjectRowsForReport.length} รายการ`]
    ];
    handoverRows.forEach((values, index) => {
      const row = 6 + index;
      writeTemplateCell('Handover', `A${row}`, values[0]);
      writeTemplateCell('Handover', `B${row}`, values[1]);
    });
    writeTemplateCell('Handover', 'A12', `ข้อมูลจาก IT Monthly Dashboard ณ ${checkedDate}`);
    writeTemplateCell('Handover', 'B12', 'ยอดรวมอ้างอิงข้อมูลในระบบ ณ เวลาที่กด Export');

    writeTemplateCell('ข้อมูลใช้งานจริง', 'A4', `ข้อมูลจากระบบ ณ ${checkedDate} สรุปยอดรวมโดยไม่แสดงข้อมูลส่วนบุคคล`);
    const usageValues = [
      ['C7', activeData.ticketsCount || 0], ['C8', activeData.responseTime || 0], ['C9', activeData.csat || 0],
      ['C10', warehouseTotalCount], ['C11', calculatedAssetValue], ['C12', activeData.totalSoftware || 0],
      ['C13', activeData.softwareCost || 0], ['C14', activeData.securityIncidents || 0], ['C15', pendingAssetReturnCount],
      ['C16', monitoredTotal], ['C17', monitoredActive], ['C18', monitoredWarning], ['C19', monitoredUnverified],
      ['C20', externalDevices.filter(device => device.status === 'overdue').length]
    ];
    usageValues.forEach(([cell, value]) => writeTemplateCell('ข้อมูลใช้งานจริง', cell, Number(value || 0)));
    writeTemplateCell('ข้อมูลใช้งานจริง', 'E10', `ว่าง ${vacantStockCount}; ชำรุด ${warehouseBrokenCount}; สูญหาย ${warehouseLostCount}`);
    writeTemplateCell('ข้อมูลใช้งานจริง', 'E14', `Backup ${activeData.backupSuccess || 0}%; Antivirus ${activeData.antivirusCoverage || 0}%; MFA ${activeData.mfaCoverage || 0}%`);
    writeTemplateCell('ข้อมูลใช้งานจริง', 'E15', `Checklist ${assetRequests.length}; Asset Return ${returnRowsForReport.length}; Incident ${incidentRowsForReport.length}`);
    for (let row = 29; row <= 32; row += 1) {
      ['A', 'B', 'C', 'D', 'E'].forEach(column => writeTemplateCell('ข้อมูลใช้งานจริง', `${column}${row}`, '-'));
    }
    brokenAssetsForReport.slice(0, 4).forEach((asset, index) => {
      const row = 29 + index;
      writeTemplateCell('ข้อมูลใช้งานจริง', `A${row}`, asset.itemType || '-');
      writeTemplateCell('ข้อมูลใช้งานจริง', `B${row}`, asset.deviceSerial || '-');
      writeTemplateCell('ข้อมูลใช้งานจริง', `C${row}`, asset.status || '-');
      writeTemplateCell('ข้อมูลใช้งานจริง', `D${row}`, asset.notes || '-');
      writeTemplateCell('ข้อมูลใช้งานจริง', `E${row}`, asset.respondent || 'ยังไม่ระบุผู้รับผิดชอบ/กำหนดเสร็จ');
    });

    // Sheet 1: Dashboard metrics (one row per month)
    const dashHeaders = FIELD_MAP.map(f => f.header);
    const rows = Object.entries(data).map(([monthKey, d]) => {
      return FIELD_MAP.map(f => {
        if (f.key === 'monthKey') return monthKey;
        return d[f.key] ?? '';
      });
    });
    const dashWs = XLSX.utils.aoa_to_sheet([dashHeaders, ...rows]);
    dashWs['!cols'] = dashHeaders.map(h => ({ wch: Math.max(h.length + 4, 18) }));
    XLSX.utils.book_append_sheet(wb, dashWs, 'Dashboard');

    // Sheet 2: Top 10 broken devices (all months)
    const repairHeaders = ['รหัสเดือน', 'ชื่ออุปกรณ์', 'จำนวนครั้งที่เสีย', 'ค่าใช้จ่ายซ่อม (บาท)'];
    const repairRows = [];
    Object.entries(data).forEach(([monthKey, d]) => {
      (d.topBrokenDevices || []).forEach(dev => {
        repairRows.push([monthKey, dev.name, dev.count, dev.cost]);
      });
    });
    const repairWs = XLSX.utils.aoa_to_sheet([repairHeaders, ...repairRows]);
    repairWs['!cols'] = repairHeaders.map(h => ({ wch: Math.max(h.length + 4, 18) }));
    XLSX.utils.book_append_sheet(wb, repairWs, 'Top10 อุปกรณ์เสียบ่อย');

    // Sheet 3: Department costs (all months)
    const deptHeaders = ['รหัสเดือน', 'ชื่อแผนก', 'ค่าใช้จ่ายซ่อม (บาท)'];
    const deptRows = [];
    Object.entries(data).forEach(([monthKey, d]) => {
      Object.entries(d.deptCosts || {}).forEach(([dept, cost]) => {
        deptRows.push([monthKey, dept, cost]);
      });
    });
    const deptWs = XLSX.utils.aoa_to_sheet([deptHeaders, ...deptRows]);
    deptWs['!cols'] = deptHeaders.map(h => ({ wch: Math.max(h.length + 4, 18) }));
    XLSX.utils.book_append_sheet(wb, deptWs, 'ค่าใช้จ่ายต่อแผนก');

    // Sheet 4: Ongoing projects (all months)
    const projHeaders = ['รหัสเดือน', 'ชื่อโครงการ', 'ประเภท', 'ผู้รับผิดชอบ', 'สถานะ', 'ความคืบหน้า (%)', 'ประหยัดเวลา (ชั่วโมง/เดือน)', 'วันที่เริ่ม', 'วันที่เป้าหมาย', 'รายละเอียด'];
    const projRows = [];
    Object.entries(data).forEach(([monthKey, d]) => {
      (d.ongoingProjects || []).forEach(proj => {
        projRows.push([monthKey, proj.title, proj.projectType || '', proj.owner || '', proj.status || '', Number(proj.progress || 0), Number(proj.hoursSaved || 0), proj.startDate || '', proj.targetDate || '', proj.desc]);
      });
    });
    const projWs = XLSX.utils.aoa_to_sheet([projHeaders, ...projRows]);
    projWs['!cols'] = projHeaders.map(h => ({ wch: Math.max(h.length + 4, 25) }));
    XLSX.utils.book_append_sheet(wb, projWs, 'โครงการดำเนินการ');

    // Sheet 5: Recommendations (all months)
    const recHeaders = ['รหัสเดือน', 'ข้อเสนอแนะ'];
    const recRows = [];
    Object.entries(data).forEach(([monthKey, d]) => {
      (d.recommendations || []).forEach(rec => {
        recRows.push([monthKey, rec]);
      });
    });
    const recWs = XLSX.utils.aoa_to_sheet([recHeaders, ...recRows]);
    recWs['!cols'] = recHeaders.map(h => ({ wch: Math.max(h.length + 4, 40) }));
    XLSX.utils.book_append_sheet(wb, recWs, 'Recommendation');

    // Sheet 6: Expiring assets details (all months)
    const expAssetHeaders = ['รหัสเดือน', 'รหัสทรัพย์สิน', 'ประเภท', 'รุ่น/โมเดล', 'แผนก', 'วันที่หมดอายุ'];
    const expAssetRows = [];
    Object.entries(data).forEach(([monthKey, d]) => {
      (d.assetsExpiringDetails || []).forEach(a => {
        expAssetRows.push([monthKey, a.id, a.type, a.model, a.dept, a.expDate]);
      });
    });
    const expAssetWs = XLSX.utils.aoa_to_sheet([expAssetHeaders, ...expAssetRows]);
    expAssetWs['!cols'] = expAssetHeaders.map(h => ({ wch: Math.max(h.length + 4, 20) }));
    XLSX.utils.book_append_sheet(wb, expAssetWs, 'อุปกรณ์ใกล้หมดอายุ');

    // Sheet 7: Expiring software details (all months)
    const expSwHeaders = ['รหัสเดือน', 'ชื่อซอฟต์แวร์', 'จำนวน Licenses', 'วันหมดสัญญา', 'สถานะ'];
    const expSwRows = [];
    Object.entries(data).forEach(([monthKey, d]) => {
      (d.softwareExpiringDetails || []).forEach(s => {
        expSwRows.push([monthKey, s.name, s.licenses, s.expiringDate, s.status]);
      });
    });
    const expSwWs = XLSX.utils.aoa_to_sheet([expSwHeaders, ...expSwRows]);
    expSwWs['!cols'] = expSwHeaders.map(h => ({ wch: Math.max(h.length + 4, 22) }));
    XLSX.utils.book_append_sheet(wb, expSwWs, 'โปรแกรมใกล้หมดอายุ');

    // Sheet 8: Employee equipment issue and return activity
    const movementHeaders = ['เลขที่คำขอ', 'พนักงาน', 'แผนก', 'ประเภทการดำเนินการ', 'อุปกรณ์ที่ขอ', 'หมายเลขเครื่อง', 'วัตถุประสงค์', 'วันที่ขอเบิก', 'วันที่ส่งมอบ', 'กำหนดคืน', 'วันที่คืนจริง', 'สภาพตอนคืน', 'สถานะ', 'ผู้ตรวจสอบ', 'หมายเหตุ'];
    const requestStatusLabels = { pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', issued: 'ส่งมอบแล้ว', overdue: 'เกินกำหนด', return_requested: 'รอ IT ตรวจรับ', returned: 'คืนแล้ว', rejected: 'ไม่อนุมัติ', need_info: 'รอข้อมูลเพิ่ม' };
    const workflowTypeLabels = { checkout: 'เบิก', replacement: 'เปลี่ยนอุปกรณ์', resignation: 'ลาออก' };
    const movementRows = assetRequests.map(request => [
      request.id,
      request.requester || '',
      request.department || '',
      workflowTypeLabels[request.workflow_type] || 'เบิก',
      request.item_type || '',
      request.device_serial || request.assigned_asset_sn || '',
      request.purpose || '',
      request.requested_date ? String(request.requested_date).slice(0, 10) : '',
      request.issue_date ? String(request.issue_date).slice(0, 10) : '',
      request.due_date ? String(request.due_date).slice(0, 10) : '',
      request.return_date ? String(request.return_date).slice(0, 10) : '',
      request.return_condition || '',
      requestStatusLabels[request.status] || request.status || '',
      request.reviewer || '',
      request.notes || ''
    ]);
    const movementWs = XLSX.utils.aoa_to_sheet([movementHeaders, ...movementRows]);
    movementWs['!cols'] = movementHeaders.map((header, index) => ({ wch: index === 14 ? 35 : Math.max(header.length + 4, 16) }));
    movementWs['!autofilter'] = { ref: `A1:O${Math.max(movementRows.length + 1, 1)}` };
    XLSX.utils.book_append_sheet(wb, movementWs, 'พนักงานเบิก-คืนอุปกรณ์');

    const appendWorkflowSheet = (name, rows) => {
      const sheet = XLSX.utils.aoa_to_sheet([movementHeaders, ...rows]);
      sheet['!cols'] = movementHeaders.map((header, index) => ({ wch: index === 14 ? 35 : Math.max(header.length + 4, 16) }));
      sheet['!autofilter'] = { ref: `A1:O${Math.max(rows.length + 1, 1)}` };
      XLSX.utils.book_append_sheet(wb, sheet, name);
    };
    appendWorkflowSheet('Checklist พนักงานเข้า-ออก', movementRows);
    appendWorkflowSheet('Asset Return', movementRows.filter((_, index) => ['return_requested', 'returned'].includes(assetRequests[index]?.status)));
    appendWorkflowSheet('Incident', movementRows.filter((_, index) => assetRequests[index]?.workflow_type === 'replacement' || ['ชำรุด', 'สูญหาย'].includes(assetRequests[index]?.return_condition)));

    // Sheet 9: Company account usage derived from the software/license register
    const accountHeaders = ['รหัสเดือน', 'ระบบ/โปรแกรม', 'บัญชี/อีเมลที่สมัคร', 'Owner', 'ผู้ใช้งานปัจจุบัน', 'License ใช้งาน', 'License ว่าง', 'สถานะ', 'วันหมดสัญญา'];
    const accountRows = [];
    Object.entries(data).forEach(([monthKey, monthData]) => {
      (monthData.softwareExpiringDetails || []).forEach(account => {
        accountRows.push([
          monthKey,
          account.name || '',
          account.registeredEmail || '',
          account.owner || '',
          account.currentUsers || '',
          Number(account.used || 0),
          Number(account.vacant || 0),
          account.status || '',
          account.expiringDate || ''
        ]);
      });
    });
    const accountWs = XLSX.utils.aoa_to_sheet([accountHeaders, ...accountRows]);
    accountWs['!cols'] = accountHeaders.map((header, index) => ({ wch: [1, 2, 4].includes(index) ? 28 : Math.max(header.length + 4, 16) }));
    accountWs['!autofilter'] = { ref: `A1:I${Math.max(accountRows.length + 1, 1)}` };
    XLSX.utils.book_append_sheet(wb, accountWs, 'การใช้งานบัญชีบริษัท');

    // Sheet 10: Vendor contracts
    const vendorHeaders = ['รหัสเดือน', 'Vendor', 'บริการ/ขอบเขตงาน', 'เลขที่สัญญา', 'วันเริ่มสัญญา', 'วันสิ้นสุดสัญญา', 'รอบชำระเงิน', 'มูลค่า (บาท)', 'ผู้ติดต่อ', 'สถานะ', 'หมายเหตุ'];
    const vendorRows = [];
    Object.entries(data).forEach(([monthKey, monthData]) => {
      (monthData.vendorContracts || []).forEach(contract => vendorRows.push([
        monthKey, contract.vendor || '', contract.service || '', contract.contractNo || '', contract.startDate || '', contract.endDate || '',
        contract.billingCycle || '', Number(contract.amount || 0), contract.contact || '', contract.status || '', contract.notes || ''
      ]));
    });
    const vendorWs = XLSX.utils.aoa_to_sheet([vendorHeaders, ...vendorRows]);
    vendorWs['!cols'] = vendorHeaders.map((header, index) => ({ wch: [1, 2, 8, 10].includes(index) ? 26 : Math.max(header.length + 4, 16) }));
    vendorWs['!autofilter'] = { ref: `A1:K${Math.max(vendorRows.length + 1, 1)}` };
    XLSX.utils.book_append_sheet(wb, vendorWs, 'Vendor Contract');

    XLSX.writeFile(wb, `IT_Dashboard_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Import data from uploaded .xlsx file
  const handleImportXlsx = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target.result;
        const wb = XLSX.read(binaryStr, { type: 'binary' });
        const newData = {};

        if (wb.SheetNames.includes('Inventory')) {
          // --- Parse Inventory spreadsheet ---
          const inventoryRows = XLSX.utils.sheet_to_json(wb.Sheets['Inventory']);
          
          const parseExcelDate = (serial) => {
            if (typeof serial === 'string') {
              const d = new Date(serial);
              return isNaN(d.getTime()) ? null : d;
            }
            if (typeof serial !== 'number') return null;
            const utc_days = Math.floor(serial - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            
            const fractional_day = serial - Math.floor(serial) + 0.0000001;
            let total_seconds = Math.floor(86400 * fractional_day);
            
            const seconds = total_seconds % 60;
            total_seconds = Math.floor(total_seconds / 60);
            const minutes = total_seconds % 60;
            const hours = Math.floor(total_seconds / 60);
            
            return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
          };

          const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear() + 543; // Thai year
            return `${day}/${month}/${year}`;
          };

          const parsedAssets = inventoryRows.map((row, i) => {
            let dateIssued = '';
            if (row['วันที่เบิกใช้งาน']) {
              const dObj = parseExcelDate(row['วันที่เบิกใช้งาน']);
              if (dObj) dateIssued = formatDate(dObj);
            }
            
            return {
              sn: row['Nember'] || (i + 1),
              date: dateIssued,
              user: row['บุคคลเบิกใช้อุปกรณ์'] || 'ส่วนกลาง/ไม่ระบุ',
              position: row['ตำแหน่ง'] || '-',
              itemType: row['รายการอุปกรณ์หลัก'] || 'อุปกรณ์เสริม/อื่นๆ',
              deviceSerial: row['หมายเลขอุปกรณ์ (เช่น  Ipad 016)'] || '-',
              status: normalizeAssetStatus(row['สถานะ']),
              notes: row['หมายเหตุ'] || '',
              submittedOn: row['Submitted on'] || '',
              respondent: row['Respondents'] || '',
              additionalEquipment: row['อุปกรณ์เพิ่มเติมที่ต้องการเบิก'] || '',
              softwareApp: row['ซอต์ฟแวร์/ App'] || '',
              registeredEmail: row['เมลที่ลงทะเบียน'] || '',
              additionalSerial: row['หมายเลขอุปกรณ์ เพิ่มเติม  (เช่น  สาย อะเเดปเตอร์ ipad-011))'] || '',
              returnDueDate: row['กำหนดคืนอุปกรณ์'] || '',
              inspectionDate: row['วันที่ตรวจสอบ'] || '',
              purchaseDate: row['วันที่ซื้อ'] || '',
              productionYear: row['ปีที่ผลิต'] || row['ปีผลิต'] || '',
              warrantyEndDate: row['วันหมดประกัน'] || '',
              expense: Number(row['ค่าใช้จ่าย']) || 0
            };
          }).map(repairThaiTextDeep);

          // Calculate asset value sum
          const CATEGORY_VALUES = {
            "Computer (Pc)": 15000,
            "Ipad": 18000,
            "Mornitor": 5000,
            "Notebook Lenovo": 25000,
            "External HDD": 1500,
            "Cable HDMI": 500,
            "Mouse": 1000,
            "Keyboard": 1500,
            "Screwdriver": 1200,
            "Notebook Asus": 20000,
            "Printer": 7500,
            "IPhone": 25000,
            "Apple Pancill": 3900,
            "Macbook": 45000,
            "Hub USB-TypeC": 1200,
            "IMac": 40000,
            "Computer (Pc), Mornitor": 20000,
            "Hub Lan": 2500,
            "Notebook Acer, Iphone": 35000,
            "Adapter Apple": 1200,
            "Cable Apple": 790,
            "Notebook HP": 22000,
            "Samsung": 15000,
            "Capture Card": 3500,
            "Reez Live": 15000,
            "Iphone": 25000
          };

          let calculatedAssetValue = 0;
          inventoryRows.forEach(row => {
            const cat = String(row['รายการอุปกรณ์หลัก'] || '').trim();
            calculatedAssetValue += CATEGORY_VALUES[cat] || 1500;
          });

          const brokenInventory = parsedAssets.filter(a => ['รอซ่อม', 'ชำรุด'].includes(normalizeAssetStatus(a.status))).length;
          const lostInventory = parsedAssets.filter(a => normalizeAssetStatus(a.status) === 'สูญหาย').length;
          const vacantInventory = parsedAssets.filter(a => normalizeAssetStatus(a.status) === 'ว่าง').length;

          // Update data metrics
          setData(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(monthKey => {
              updated[monthKey] = {
                ...updated[monthKey],
                totalAssets: parsedAssets.length,
                assetValue: calculatedAssetValue,
                assetsBroken: brokenInventory,
                assetsLost: lostInventory,
                assetsVacant: vacantInventory
              };
            });
            return updated;
          });

          setAssetsList(parsedAssets);
          setImportStatus({ type: 'success', message: `นำเข้าข้อมูลคลังอุปกรณ์สำเร็จ! พบอุปกรณ์ ${parsedAssets.length} รายการ` });
          setTimeout(() => setImportStatus(null), 4000);
          return;
        }

        if (wb.SheetNames.includes('Form')) {
          // --- Parse Custom Form & IT Expenses Structure ---
          const formRows = XLSX.utils.sheet_to_json(wb.Sheets['Form']);
          const costRows = XLSX.utils.sheet_to_json(wb.Sheets['ค่าใช้จ่าย IT'] || wb.Sheets[wb.SheetNames[1]]);
          
          const parseExcelDate = (serial) => {
            if (typeof serial === 'string') {
              const d = new Date(serial);
              return isNaN(d.getTime()) ? null : d;
            }
            if (typeof serial !== 'number') return null;
            const utc_days = Math.floor(serial - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            
            const fractional_day = serial - Math.floor(serial) + 0.0000001;
            let total_seconds = Math.floor(86400 * fractional_day);
            
            const seconds = total_seconds % 60;
            total_seconds = Math.floor(total_seconds / 60);
            const minutes = total_seconds % 60;
            const hours = Math.floor(total_seconds / 60);
            
            return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
          };

          const parseDurationToMinutes = (val) => {
            if (!val) return 0;
            if (typeof val === 'number') {
              return Math.round(val * 24 * 60);
            }
            const str = String(val).trim();
            const parts = str.split(':');
            if (parts.length === 2) {
              const h = parseInt(parts[0], 10) || 0;
              const m = parseInt(parts[1], 10) || 0;
              return h * 60 + m;
            }
            return parseFloat(str) || 0;
          };

          const THAI_MONTHS = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
          ];

          const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear() + 543; // Thai year
            const hours = String(d.getHours()).padStart(2, '0');
            const mins = String(d.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${mins}`;
          };

          formRows.forEach((row, rowIndex) => {
            const dateObj = parseExcelDate(row['Submitted on']);
            if (!dateObj) return;

            const year = dateObj.getFullYear();
            const monthIndex = dateObj.getMonth();
            const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
            const monthName = `${THAI_MONTHS[monthIndex]} ${year + 543}`;
            
            if (!newData[monthKey]) {
              newData[monthKey] = {
                monthName: monthName,
                totalAssets: 0,
                assetValue: 0,
                assetsExpiring: 0,
                assetsBroken: 0,
                assetsLost: 0,
                ticketsCount: 0,
                slaPercent: 0,
                responseTime: 0,
                resolutionTime: 0,
                csat: 0,
                totalSoftware: 24,
                licensesInUse: 0,
                licensesVacant: 0,
                softwareCost: 0,
                softwareAnnualCost: 0,
                softwareExpiring: 2,
                backupSuccess: 99.9,
                securityIncidents: 0,
                antivirusCoverage: 98.5,
                mfaCoverage: 0.0,
                repairCount: 0,
                repairCost: 0,
                topBrokenDevices: [],
                deptCosts: {},
                softwareExpiringDetails: [
                  { name: "Microsoft 365 Copilot", licenses: 50, expiringDate: "30 ส.ค. 2026", status: "ใกล้หมดอายุ" },
                  { name: "Adobe Creative Cloud", licenses: 15, expiringDate: "12 ก.ย. 2026", status: "แจ้งเตือนล่วงหน้า" }
                ],
                assetsExpiringDetails: [
                  { id: "AST-NB-001", type: "Laptop", model: "Lenovo ThinkPad L14", dept: "Operations", expDate: "15 ส.ค. 2026" },
                  { id: "AST-PR-004", type: "Printer", model: "HP LaserJet Pro M404", dept: "Accounting", expDate: "22 ส.ค. 2026" }
                ],
                ongoingProjects: [],
                recommendations: [],
                ticketsList: [], // Store raw ticket data here
                _durationSum: 0,
                _durationCount: 0,
                _slaCompliantCount: 0,
                _deviceCounts: {},
                _deviceCosts: {}
              };
            }

            const monthData = newData[monthKey];
            monthData.ticketsCount++;

            const durationMins = parseDurationToMinutes(row['เวลาที่ใช้ในการทำงาน']);
            if (durationMins > 0) {
              monthData._durationSum += durationMins;
              monthData._durationCount++;
              if (durationMins <= 60) {
                monthData._slaCompliantCount++;
              }
            } else {
              monthData._slaCompliantCount++;
            }

            // Determine issue type and save ticket
            const hwIssue = row['แจ้ง ฮาร์ดแวร์ ขัดข้อง'];
            const swIssue = row['แจ้ง ซอต์ฟแวร์ ขัดข้อง'] || row['แจ้ง ซоต์ฟแวร์ ขัดข้อง'];
            const netIssue = row['แจ้ง ระบบเน็ตเวิร์ค ขัดข้อง'];
            const acctIssue = row['แจ้งขอบัญชีการใช้งานต่าง / ขัดข้อง'];
            
            let issueSummary = [];
            if (hwIssue) issueSummary.push(`ฮาร์ดแวร์: ${hwIssue}`);
            if (swIssue) issueSummary.push(`ซอฟต์แวร์: ${swIssue}`);
            if (netIssue) issueSummary.push(`เน็ตเวิร์ค: ${netIssue}`);
            if (acctIssue) issueSummary.push(`บัญชีผู้ใช้: ${acctIssue}`);
            
            const finalIssueText = issueSummary.join(', ') || row['อาการเสียต่างๆ'] || 'แจ้งติดตั้ง/อื่นๆ';

            monthData.ticketsList.push({
              sn: row['SN'] || (rowIndex + 1),
              date: formatDate(dateObj),
              complainant: row['ชื่อ-นามสกุล'] || '',
              email: row['Email'] || '-',
              anydesk: row['เลขที่ Any Desk'] || '-',
              issue: finalIssueText,
              cause: row['สาเหตุการเสีย'] || '-',
              duration: row['เวลาที่ใช้ในการทำงาน'] || '-',
              responder: row['Respondents'] || '-',
              status: row['ความคืบหน้า'] || 'เสร็จสิ้น',
              cost: Number(row['จำนวนเงิน']) || 0
            });

            const hwField = row['แจ้ง ฮาร์ดแวร์ ขัดข้อง'] || row['แจ้งติดตั้ง ฮาร์ดแวร์'];
            if (hwField) {
              const devices = String(hwField).split(',').map(d => d.trim()).filter(Boolean);
              devices.forEach(device => {
                if (device === 'Acc' || device === 'Morning Berf' || device === 'Meeting') return;
                
                monthData.assetsBroken++;
                monthData.repairCount++;
                monthData._deviceCounts[device] = (monthData._deviceCounts[device] || 0) + 1;
                
                const ticketCost = Number(row['จำนวนเงิน']) || 0;
                if (ticketCost > 0) {
                  monthData.repairCost += ticketCost;
                  monthData._deviceCosts[device] = (monthData._deviceCosts[device] || 0) + ticketCost;
                }
              });
            }
          });

          if (costRows) {
            costRows.forEach((row, i) => {
              let dateObj = parseExcelDate(row['วันที่']);
              if (!dateObj && row['เดือน']) {
                const mIdx = THAI_MONTHS.indexOf(row['เดือน'].trim());
                if (mIdx !== -1) {
                  dateObj = new Date(2026, mIdx, 15);
                }
              }
              
              if (!dateObj) return;
              
              const year = dateObj.getFullYear();
              const monthIndex = dateObj.getMonth();
              const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
              
              if (newData[monthKey]) {
                const amount = Number(row['จำนวนเงิน']) || 0;
                newData[monthKey].repairCost += amount;
                newData[monthKey].repairCount++;
                
                newData[monthKey].ticketsList.push({
                  sn: `EXP-${row['ลำดับ'] || (i + 1)}`,
                  date: formatDate(dateObj),
                  complainant: row['ชื่อ-นามสกุล'] || 'IT Dept',
                  issue: `ค่าใช้จ่าย IT: ${row['ค่าใช้จ่าย'] || 'ซื้ออุปกรณ์'} (${row['สาเหตุการเสีย'] || 'เสื่อมตามสภาพ'})`,
                  duration: '-',
                  responder: '-',
                  status: 'จ่ายเงินแล้ว',
                  cost: amount
                });
              }
            });
          }

          Object.keys(newData).forEach(monthKey => {
            const monthData = newData[monthKey];
            
            if (monthData._durationCount > 0) {
              const avgMins = monthData._durationSum / monthData._durationCount;
              monthData.resolutionTime = Number((avgMins / 60).toFixed(1));
              
              const slaPct = (monthData._slaCompliantCount / monthData._durationCount) * 100;
              monthData.slaPercent = Number(slaPct.toFixed(1));
            } else {
              monthData.resolutionTime = 0.5;
              monthData.slaPercent = 100.0;
            }

            monthData.responseTime = Math.max(5, Math.round(monthData.resolutionTime * 12));
            const baseCSAT = 4.5 + (monthData.slaPercent / 100) * 0.4;
            monthData.csat = Number(baseCSAT.toFixed(1));

            monthData.totalAssets = 150 + monthData.ticketsCount;
            monthData.assetValue = monthData.totalAssets * 25000;
            monthData.assetsExpiring = Math.round(monthData.totalAssets * 0.03);
            monthData.assetsLost = monthData.ticketsCount > 40 ? 1 : 0;

            monthData.licensesInUse = monthData.totalAssets * 1.5;
            monthData.licensesVacant = Math.round(monthData.licensesInUse * 0.15);
            monthData.softwareCost = monthData.licensesInUse * 450;

            const deviceNames = Object.keys(monthData._deviceCounts);
            monthData.topBrokenDevices = deviceNames.map(name => {
              return {
                name: name,
                count: monthData._deviceCounts[name],
                cost: monthData._deviceCosts[name] || 0
              };
            }).sort((a, b) => b.count - a.count).slice(0, 10);

            const placeholderDevices = [
              "Notebook", "PC Computer", "Printer", "Smartphone", "Mac",
              "iPad", "CCTV", "Mouse", "Keyboard", "Router"
            ];
            placeholderDevices.forEach(pDev => {
              if (monthData.topBrokenDevices.length < 10 && !monthData.topBrokenDevices.find(d => d.name === pDev)) {
                monthData.topBrokenDevices.push({ name: pDev, count: 0, cost: 0 });
              }
            });

            const deptDistribution = {
              "Accounting & Finance": 0.25,
              "Sales & Marketing": 0.20,
              "Human Resources": 0.15,
              "Operations": 0.30,
              "IT & Infrastructure": 0.10
            };
            Object.keys(deptDistribution).forEach(dept => {
              monthData.deptCosts[dept] = Math.round(monthData.repairCost * deptDistribution[dept]);
            });

            monthData.automationsDone = Math.round(monthData.ticketsCount / 10);
            monthData.aiApps = 2;
            monthData.hoursSaved = monthData.automationsDone * 15;
            monthData.ongoingProjects = [
              { title: "IT Ticket Automation", desc: `พัฒนาสคริปต์ช่วยจัดการปัญหาซ้ำซาก คืบหน้า ${Math.min(95, 40 + monthData.automationsDone * 5)}%` },
              { title: "Asset Management System", desc: "ระบบเช็คอิน-เช็คเอาท์อุปกรณ์ไอที คืบหน้า 60%" }
            ];

            if (monthData.assetsBroken > 5) {
              monthData.recommendations.push(`พบปัญหาอุปกรณ์ขัดข้องสูงถึง ${monthData.assetsBroken} ครั้งในเดือนนี้ แนะนำจัดรอบบำรุงรักษาเชิงป้องกัน (Preventive Maintenance) โดยเฉพาะอุปกรณ์ประเภท ${monthData.topBrokenDevices[0]?.name || 'Notebook'}`);
            }
            if (monthData.slaPercent < 95) {
              monthData.recommendations.push(`อัตราการบรรลุเป้าหมาย SLA ลดลงเหลือ ${monthData.slaPercent}% แนะนำให้ปรับกระบวนการคัดกรอง Ticket เพื่อเพิ่มความรวดเร็วในการแก้ปัญหา`);
            } else {
              monthData.recommendations.push("การสนับสนุนผู้ใช้ระบบ IT อยู่ในเกณฑ์ดีเยี่ยม สามารถรักษามาตรฐาน SLA ได้ตามเป้าหมาย");
            }
            monthData.recommendations.push("แนะนำให้ผู้ใช้อัปเกรดความปลอดภัยของบัญชีผ่านการเปิดใช้งาน MFA ครบ 100%");

            delete monthData._durationSum;
            delete monthData._durationCount;
            delete monthData._slaCompliantCount;
            delete monthData._deviceCounts;
            delete monthData._deviceCosts;
          });

        } else {
          // --- Parse Sheet 1: Dashboard (by column index) ---
          const dashSheet = wb.Sheets[wb.SheetNames[0]];
          if (!dashSheet) throw new Error('ไม่พบ Sheet แรก (Dashboard)');
          const allRows = XLSX.utils.sheet_to_json(dashSheet, { header: 1 });
          const dashboardHeaders = (allRows[0] || []).map((header) => String(header ?? '').trim());
          const dashboardHeaderIndex = new Map(dashboardHeaders.map((header, index) => [header, index]));
          const monthNameIndex = dashboardHeaderIndex.get(FIELD_MAP.find((field) => field.key === 'monthName').header) ?? 0;
          const monthKeyIndex = dashboardHeaderIndex.get(FIELD_MAP.find((field) => field.key === 'monthKey').header) ?? 1;
          // Skip header row (index 0), data starts from row 1
          const dataRows = allRows.slice(1).filter(r => r && r.length > 1);
          if (dataRows.length === 0) throw new Error('ไม่พบข้อมูลใน Sheet Dashboard');

          dataRows.forEach(cols => {
            const monthName = String(cols[monthNameIndex] || '').trim();
            const monthKey = String(cols[monthKeyIndex] || '').trim();

            if (!monthKey || !monthName) return;

            const monthData = {
              monthName,
              topBrokenDevices: [],
              deptCosts: {},
              ongoingProjects: [],
              recommendations: [],
              softwareExpiringDetails: [],
              assetsExpiringDetails: []
            };

            // Match by header name so older templates remain compatible when new fields are added.
            FIELD_MAP.forEach((field) => {
              if (field.key === 'monthKey' || field.key === 'monthName') return;
              const columnIndex = dashboardHeaderIndex.get(field.header);
              const rawVal = columnIndex === undefined ? undefined : cols[columnIndex];
              monthData[field.key] = rawVal !== undefined && rawVal !== '' ? Number(rawVal) : 0;
            });

            newData[monthKey] = monthData;
          });

          // --- Parse Sheet 2: Top 10 Broken Devices (optional) ---
          if (wb.SheetNames.length >= 2) {
            const repairSheet = wb.Sheets[wb.SheetNames[1]];
            if (repairSheet) {
              const rows = XLSX.utils.sheet_to_json(repairSheet, { header: 1 }).slice(1);
              rows.forEach(cols => {
                const mk = String(cols[0] || '').trim();
                if (mk && newData[mk]) {
                  newData[mk].topBrokenDevices.push({
                    name: String(cols[1] || ''),
                    count: Number(cols[2]) || 0,
                    cost: Number(cols[3]) || 0
                  });
                }
              });
            }
          }

          // --- Parse Sheet 3: Department Costs (optional) ---
          if (wb.SheetNames.length >= 3) {
            const deptSheet = wb.Sheets[wb.SheetNames[2]];
            if (deptSheet) {
              const rows = XLSX.utils.sheet_to_json(deptSheet, { header: 1 }).slice(1);
              rows.forEach(cols => {
                const mk = String(cols[0] || '').trim();
                if (mk && newData[mk]) {
                  const deptName = String(cols[1] || '');
                  const deptCost = Number(cols[2]) || 0;
                  if (deptName) newData[mk].deptCosts[deptName] = deptCost;
                }
              });
            }
          }

          // --- Parse Sheet 4: Ongoing Projects (optional) ---
          if (wb.SheetNames.length >= 4) {
            const projSheet = wb.Sheets[wb.SheetNames[3]];
            if (projSheet) {
              const rows = XLSX.utils.sheet_to_json(projSheet, { header: 1 }).slice(1);
              rows.forEach(cols => {
                const mk = String(cols[0] || '').trim();
                if (mk && newData[mk]) {
                  newData[mk].ongoingProjects.push({
                    title: String(cols[1] || ''),
                    desc: String(cols[2] || '')
                  });
                }
              });
            }
          }

          // --- Parse Sheet 5: Recommendations (optional) ---
          if (wb.SheetNames.length >= 5) {
            const recSheet = wb.Sheets[wb.SheetNames[4]];
            if (recSheet) {
              const rows = XLSX.utils.sheet_to_json(recSheet, { header: 1 }).slice(1);
              rows.forEach(cols => {
                const mk = String(cols[0] || '').trim();
                if (mk && newData[mk]) {
                  const recText = String(cols[1] || '');
                  if (recText) newData[mk].recommendations.push(recText);
                }
              });
            }
          }

          // --- Parse Sheet 6: Expiring Assets Details (optional) ---
          if (wb.SheetNames.length >= 6) {
            const expAssetSheet = wb.Sheets[wb.SheetNames[5]];
            if (expAssetSheet) {
              const rows = XLSX.utils.sheet_to_json(expAssetSheet, { header: 1 }).slice(1);
              rows.forEach(cols => {
                const mk = String(cols[0] || '').trim();
                if (mk && newData[mk]) {
                  newData[mk].assetsExpiringDetails.push({
                    id: String(cols[1] || ''),
                    type: String(cols[2] || ''),
                    model: String(cols[3] || ''),
                    dept: String(cols[4] || ''),
                    expDate: String(cols[5] || '')
                  });
                }
              });
            }
          }

          // --- Parse Sheet 7: Expiring Software Details (optional) ---
          if (wb.SheetNames.length >= 7) {
            const expSwSheet = wb.Sheets[wb.SheetNames[6]];
            if (expSwSheet) {
              const rows = XLSX.utils.sheet_to_json(expSwSheet, { header: 1 }).slice(1);
              rows.forEach(cols => {
                const mk = String(cols[0] || '').trim();
                if (mk && newData[mk]) {
                  newData[mk].softwareExpiringDetails.push({
                    name: String(cols[1] || ''),
                    licenses: Number(cols[2]) || 0,
                    expiringDate: String(cols[3] || ''),
                    status: String(cols[4] || '')
                  });
                }
              });
            }
          }
        }

        // Update state
        const monthKeys = Object.keys(newData);
        if (monthKeys.length === 0) throw new Error('ไม่พบข้อมูลเดือนที่สามารถนำเข้าได้');

        setData(newData);
        setCurrentMonth(monthKeys[0]);
        setConsoleMonth(monthKeys[0]);
        setImportStatus({ type: 'success', message: `นำเข้าสำเร็จ! พบข้อมูล ${monthKeys.length} เดือน` });
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err) {
        setImportStatus({ type: 'error', message: `นำเข้าล้มเหลว: ${err.message}` });
        setTimeout(() => setImportStatus(null), 5000);
      }
    };
    reader.readAsBinaryString(file);
    // Reset the file input so re-uploading the same file triggers onChange
    e.target.value = '';
  };

  // Sync state data with form inputs when opening the edit modal
  const openEditModal = () => {
    setFormInputs({
      // Assets
      totalAssets: activeData.totalAssets,
      assetValue: activeData.assetValue,
      assetsExpiring: activeData.assetsExpiring,
      assetsBroken: activeData.assetsBroken,
      assetsLost: activeData.assetsLost,
      assetsVacant: activeData.assetsVacant || 0,
      // Support
      ticketsCount: activeData.ticketsCount,
      slaPercent: activeData.slaPercent,
      responseTime: activeData.responseTime,
      resolutionTime: activeData.resolutionTime,
      csat: activeData.csat,
      // Software
      totalSoftware: activeData.totalSoftware,
      licensesInUse: activeData.licensesInUse,
      licensesVacant: activeData.licensesVacant,
      softwareCost: activeData.softwareCost,
      softwareAnnualCost: activeData.softwareAnnualCost,
      softwareExpiring: activeData.softwareExpiring,
      // Security
      backupSuccess: activeData.backupSuccess,
      securityIncidents: activeData.securityIncidents,
      antivirusCoverage: activeData.antivirusCoverage,
      mfaCoverage: activeData.mfaCoverage,
      // Repair
      repairCount: activeData.repairCount,
      repairCost: activeData.repairCost,
      // Recommendations text
      recommendations: activeData.recommendations.join('\n')
    });
    setActiveModal('edit');
  };

  // Save edit form modifications back to monthly state data
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setData(prev => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        totalAssets: Number(formInputs.totalAssets),
        assetValue: Number(formInputs.assetValue),
        assetsExpiring: Number(formInputs.assetsExpiring),
        assetsBroken: Number(formInputs.assetsBroken),
        assetsLost: Number(formInputs.assetsLost),
        assetsVacant: Number(formInputs.assetsVacant || 0),

        ticketsCount: Number(formInputs.ticketsCount),
        slaPercent: Number(formInputs.slaPercent),
        responseTime: Number(formInputs.responseTime),
        resolutionTime: Number(formInputs.resolutionTime),
        csat: Number(formInputs.csat),

        totalSoftware: Number(formInputs.totalSoftware),
        licensesInUse: Number(formInputs.licensesInUse),
        licensesVacant: Number(formInputs.licensesVacant),
        softwareCost: Number(formInputs.softwareCost),
        softwareAnnualCost: Number(formInputs.softwareAnnualCost),
        softwareExpiring: Number(formInputs.softwareExpiring),

        backupSuccess: Number(formInputs.backupSuccess),
        securityIncidents: Number(formInputs.securityIncidents),
        antivirusCoverage: Number(formInputs.antivirusCoverage),
        mfaCoverage: Number(formInputs.mfaCoverage),

        repairCount: Number(formInputs.repairCount),
        repairCost: Number(formInputs.repairCost),
        
        recommendations: formInputs.recommendations.trim() ? formInputs.recommendations.split('\n') : []
      }
    }));
    setActiveModal(null);
  };

  // Helper component to render circular gauges for security block
  const CircularProgress = ({ value, label }) => {
    const radius = 27;
    const maxOffset = 170; // 2 * PI * radius
    const strokeOffset = maxOffset - (value / 100) * maxOffset;

    let strokeColor = 'var(--danger)';
    if (value >= 99) strokeColor = 'var(--success)';
    else if (value >= 95) strokeColor = 'var(--warning)';

    return (
      <div className="gauge-item">
        <div className="gauge-circle">
          <svg className="gauge-svg">
            <circle className="gauge-bg" cx="30" cy="30" r={radius}></circle>
            <circle 
              className="gauge-bar" 
              cx="30" 
              cy="30" 
              r={radius}
              style={{ strokeDashoffset: strokeOffset, stroke: strokeColor }}
            ></circle>
          </svg>
          <div className="gauge-text">{Math.round(value)}%</div>
        </div>
        <div className="metric-label">{label}</div>
      </div>
    );
  };

  const monitoredTotal = externalDevices.length;
  // Active includes devices that are also close to their due date. The warning
  // metric is a subset of Active, matching the Device Monitor source dashboard.
  const monitoredActive = externalDevices.filter(d => d.status === 'active').length;
  const monitoredWarning = externalDevices.filter(d => d.status === 'active' && d.daysRemaining <= 7).length;
  const monitoredUnverified = externalDevices.filter(d => d.status !== 'active').length;
  const appBugReports = activeData.ticketsList.filter(ticket => {
    const searchableText = [ticket.issue, ticket.cause].filter(Boolean).join(' ');
    return /\[(?:dashboard bug|app bug|it dashboard)\]|it[- ]monthly[- ]dashboard|it-monthly-dashboard-new\.onrender\.com|บัค(?:ของ)?(?:ระบบ|แดชบอร์ด)|ปัญหา(?:ของ|บน)แดชบอร์ด/i.test(searchableText);
  });
  const closedAppBugStatuses = new Set(['เสร็จสิ้น', 'ปิดงาน', 'closed', 'resolved', 'จ่ายเงินแล้ว']);
  const openAppBugReports = appBugReports.filter(ticket =>
    !closedAppBugStatuses.has(String(ticket.status || '').trim().toLocaleLowerCase('th-TH'))
  );
  const closedAppBugReports = appBugReports.length - openAppBugReports.length;
  const highPriorityAppBugReports = appBugReports.filter(ticket =>
    /\[high\]|ด่วนที่สุด|ร้ายแรง|critical|high/i.test(`${ticket.issue || ''} ${ticket.cause || ''}`)
  ).length;
  const pendingAssetApprovalCount = assetRequests.filter(request =>
    ['pending', 'need_info', 'approved'].includes(request.status)
  ).length;
  const pendingAssetReturnCount = assetRequests.filter(request =>
    request.status === 'return_requested'
  ).length;
  const pendingTicketCloseCount = (data[currentMonth]?.ticketsList || []).filter(ticket =>
    ticket.status === 'กำลังดำเนินการ'
  ).length;

  const pendingTicketsCount = pendingTicketCloseCount;
  const pendingAssetRequestsCount = (assetRequests || []).filter(req => req.status === 'pending').length;
  return (
    <>
      {/* SIDEBAR NAVIGATION CONTROL PANEL */}
      <aside id="dashboard-sidebar" className={`sidebar no-print ${mobileSidebarOpen ? 'mobile-active' : ''}`}>
        <div className="logo-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img className="fern-brand-logo" src={fernAesthetiqueLogo} alt="Fern Aesthetique" />
          <button 
            onClick={() => setMobileSidebarOpen(false)} 
            className="mobile-menu-close"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-primary-actions">
          {canRequestService && <>
          <button
            onClick={() => {
              setMobileSidebarOpen(false);
              navigate('/form');
            }}
            className="sidebar-form-btn"
            style={{ position: 'relative' }}
          >
            แจ้ง Ticket
            <span
              className={`menu-count-badge sidebar-notification-count ${pendingTicketsCount > 0 ? 'has-items' : ''}`}
              aria-label={`Ticket ที่รอดำเนินการ ${pendingTicketsCount} รายการ`}
            >
              {pendingTicketsCount}
            </span>
          </button>
          <button onClick={() => {
            setAssetWorkflowRole('requester');
            setMobileSidebarOpen(false);
            setActiveModal('assetWorkflow');
          }} className="sidebar-btn" style={{ backgroundColor: '#7c3aed', border: 'none', color: 'white', position: 'relative' }}>
            <Ticket size={16} />
            ขอเบิกอุปกรณ์
            <span
              className={`menu-count-badge sidebar-notification-count ${pendingAssetRequestsCount > 0 ? 'has-items' : ''}`}
              aria-label={`คำขอเบิกอุปกรณ์ที่รออนุมัติ ${pendingAssetRequestsCount} รายการ`}
            >
              {pendingAssetRequestsCount}
            </span>
          </button>
          <button onClick={() => {
            setAssetReturnView('returns');
            setAssetReturnSearch('');
            setAssetReturnIdentity('');
            setMobileSidebarOpen(false);
            setActiveModal('assetReturns');
          }} className="sidebar-btn asset-return-menu-btn">
            <RotateCcw size={16} />
            คืนอุปกรณ์
            <span
              className={`menu-count-badge sidebar-notification-count ${pendingAssetReturnCount > 0 ? 'has-items' : ''}`}
              aria-label={`มีอุปกรณ์รอ IT ตรวจรับ ${pendingAssetReturnCount} รายการ`}
            >
              {pendingAssetReturnCount}
            </span>
          </button>
          <button onClick={() => { setOperationsLogView('checklist'); setMobileSidebarOpen(false); setActiveModal('operationsLog'); }} className="sidebar-btn">
            Checklist พนักงานเข้า-ออก
          </button>
          <button onClick={() => { setOperationsLogView('returns'); setMobileSidebarOpen(false); setActiveModal('operationsLog'); }} className="sidebar-btn">
            Asset Return
          </button>
          <button onClick={() => { setOperationsLogView('incidents'); setMobileSidebarOpen(false); setActiveModal('operationsLog'); }} className="sidebar-btn">
            Incident
          </button>
          </>}
        </div>

        {/* Month Dropdown Selection */}
        <div className="control-group">
          <label className="control-label">เลือกเดือนที่ต้องการรายงาน</label>
          <select 
            className="month-selector"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
          >
            {Object.keys(data).sort((a, b) => b.localeCompare(a)).map(key => (
              <option key={key} value={key}>{data[key].monthName}</option>
            ))}
          </select>
        </div>

        {/* Data Customizer Trigger */}
        {isAdmin && <div className="control-group">
          <div 
            onClick={() => setSidebarExpanded(prev => ({ ...prev, mgmt: !prev.mgmt }))}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}
          >
            <label className="control-label" style={{ margin: 0, cursor: 'pointer' }}>🛠️ การจัดการข้อมูล</label>
            {sidebarExpanded.mgmt ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {sidebarExpanded.mgmt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => requireAdminAccess(openEditModal)} className="sidebar-btn">
                <Edit3 size={16} />
                แก้ไขตัวเลขเดือนนี้
              </button>
              <button onClick={() => requireAdminAccess(() => {
                setConsoleMonth(currentMonth);
                setActiveModal('fullConsole');
              })} className="sidebar-btn secondary">
                <Database size={16} />
                ปรับเปลี่ยนข้อมูลทั้งหมด
              </button>

              <button onClick={() => requireAdminAccess(() => {
                setLarkFormType('asset');
                setLarkTicketRole('user');
                setLarkSubmitted(false);
                setActiveModal('larkForm');
              })} className="sidebar-btn" style={{ backgroundColor: '#06b6d4', border: 'none', color: 'white' }}>
                <Laptop size={16} />
                ลงทะเบียนเครื่องเข้าคลัง
              </button>
              <button onClick={() => requireAdminAccess(() => {
                setAssetWorkflowRole('it');
                setActiveModal('assetWorkflow');
              })} className="sidebar-btn" style={{ backgroundColor: '#4338ca', border: 'none', color: 'white' }}>
                <ShieldCheck size={16} />
                IT อนุมัติการใช้งาน
                <span className={`menu-count-badge ${pendingAssetApprovalCount > 0 ? 'has-items' : ''}`}>{pendingAssetApprovalCount}</span>
              </button>
              <button onClick={() => requireAdminAccess(() => {
                setLarkFormType('ticket');
                setLarkTicketRole('it');
                setLarkSubmitted(false);
                setSelectedPendingTicketSn('');
                setActiveModal('larkForm');
              })} className="sidebar-btn" style={{ backgroundColor: '#f59e0b', border: 'none', color: 'white' }}>
                <Wrench size={16} />
                เมนูปิดงาน (IT Close)
                <span className={`menu-count-badge ${pendingTicketCloseCount > 0 ? 'has-items' : ''}`}>{pendingTicketCloseCount}</span>
              </button>
              <button onClick={() => requireAdminAccess(() => setActiveModal('userAccess'))} className="sidebar-btn user-access-menu-btn">
                <ShieldCheck size={16} />
                จัดการสิทธิ์ผู้ใช้งาน
              </button>
              <button onClick={() => requireAdminAccess(() => setActiveModal('vendorContracts'))} className="sidebar-btn user-access-menu-btn">
                <FileCode size={16} />
                Vendor Contract
              </button>
              <button onClick={() => requireAdminAccess(() => setActiveModal('projectRegistry'))} className="sidebar-btn user-access-menu-btn">
                <Lightbulb size={16} />
                ขึ้นระบบโปรเจกต์
              </button>
            </div>
          )}
        </div>}

        {/* XLSX Database Operations */}
        {isAdmin && <div className="control-group">
          <div 
            onClick={() => setSidebarExpanded(prev => ({ ...prev, excel: !prev.excel }))}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}
          >
            <label className="control-label" style={{ margin: 0, cursor: 'pointer' }}>📊 ฐานข้อมูล Excel (.xlsx)</label>
            {sidebarExpanded.excel ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {sidebarExpanded.excel && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleImportXlsx}
              />
              <button onClick={() => requireAdminAccess(() => fileInputRef.current?.click())} className="sidebar-btn" style={{ backgroundColor: '#059669' }}>
                <Upload size={16} />
                นำเข้าข้อมูลจาก Excel
              </button>
              <button onClick={() => requireAdminAccess(exportToXlsx)} className="sidebar-btn secondary">
                <Download size={16} />
                ส่งออกข้อมูลเป็น Excel
              </button>
              <button onClick={downloadTemplate} className="sidebar-btn secondary">
                <FileSpreadsheet size={16} />
                ดาวน์โหลดเทมเพลต Excel
              </button>
              {importStatus && (
                <div style={{
                  marginTop: '4px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '500',
                  backgroundColor: importStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: importStatus.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  border: `1px solid ${importStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  wordBreak: 'break-word'
                }}>
                  {importStatus.type === 'success' ? <CheckCircle size={13} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> : <AlertTriangle size={13} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />}
                  {importStatus.message}
                </div>
              )}
            </div>
          )}
        </div>}

        {/* PDF Printing Trigger */}
        <div className="control-group" style={{ marginTop: '10px' }}>
          <div 
            onClick={() => setSidebarExpanded(prev => ({ ...prev, export: !prev.export }))}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}
          >
            <label className="control-label" style={{ margin: 0, cursor: 'pointer' }}>📄 ส่งออกเอกสาร</label>
            {sidebarExpanded.export ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {sidebarExpanded.export && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => window.print()} className="sidebar-btn secondary">
                <Printer size={16} />
                บันทึกเป็น PDF / พิมพ์
              </button>
            </div>
          )}
        </div>

        <div className="org-info">
          <p><strong>หน่วยงาน:</strong> ฝ่ายเทคโนโลยีสารสนเทศ (IT)</p>
          <p><strong>องค์กร:</strong> Fern Aesthetique</p>
          <p style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            ปรับปรุงข้อมูลล่าสุด: <br />18 กรกฎาคม 2026
          </p>
        </div>
      </aside>

      <button
        type="button"
        className={`mobile-menu-backdrop no-print ${mobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-label="ปิดเมนู"
        tabIndex={mobileSidebarOpen ? 0 : -1}
      />

      {/* DASHBOARD GRID CONTENT */}
      <main className="dashboard-container">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setMobileSidebarOpen(true)} 
              className="mobile-menu-toggle"
              aria-label="เปิดเมนู"
              aria-controls="dashboard-sidebar"
              aria-expanded={mobileSidebarOpen}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
            >
              <Menu size={24} />
            </button>
            <div className="dashboard-title">
              <h2>รายงานสรุปการดำเนินงานเทคโนโลยีสารสนเทศ (IT Monthly Dashboard)</h2>
              <p>ประจำเดือน {activeData.monthName}</p>
            </div>
          </div>
          <div className="header-status status-indicator" style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'none' }}>
            <div className="signed-in-user">
              <span><strong>{currentUser?.name}</strong><small>{ROLE_LABELS[currentUser?.role] || currentUser?.role}</small></span>
              <button type="button" onClick={onLogout}>ออกจากระบบ</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.1)', padding: '5px 12px', borderRadius: '20px' }}>
              <span className="status-dot"></span>
              <span>ระบบรายงานพร้อมทำงาน</span>
            </div>
          </div>
          <button onClick={onLogout} className="mobile-logout-btn" title="ออกจากระบบ"><X size={18} /></button>
        </header>

        <section className="dashboard-grid">
          {/* CARD 0: DEVICE MONITOR */}
          <article className="card asset-card" style={{ borderColor: monitoredUnverified > 0 || monitoredWarning > 0 ? 'var(--warning)' : 'var(--border-color)' }}>
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><ShieldCheck size={18} style={{ color: 'var(--primary)' }} /></span>
                ติดตามสถานะอุปกรณ์ iOS (Device Monitor)
              </h3>
              <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: externalDevicesSyncError ? 'var(--danger)' : isFetchingDevices ? 'var(--warning)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {externalDevicesSyncError || (isFetchingDevices
                    ? 'กำลังซิงค์...'
                    : externalDevicesLastSynced
                      ? `ซิงค์ล่าสุด ${externalDevicesLastSynced.toLocaleTimeString('th-TH')}`
                      : 'รอซิงค์ข้อมูล')}
                </span>
                <button
                  type="button"
                  title="ซิงค์ Device Monitor ตอนนี้"
                  aria-label="ซิงค์ Device Monitor ตอนนี้"
                  onClick={() => setExternalDevicesRefreshKey(previous => previous + 1)}
                  disabled={isFetchingDevices}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', padding: 0, borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)', cursor: isFetchingDevices ? 'wait' : 'pointer' }}
                >
                  <RotateCcw size={14} className={isFetchingDevices ? 'device-sync-spinning' : ''} />
                </button>
              </div>
            </div>
            <div className="metrics-row" style={{ marginTop: '15px' }}>
              <div 
                className="metric-item" 
                style={{ cursor: 'pointer' }}
                onClick={() => window.open(IOS_DEVICE_MONITOR_BASE, '_blank')}
              >
                <div className="metric-label">กำลังติดตามรวม</div>
                <div className="metric-value highlight-primary">{monitoredTotal} เครื่อง</div>
              </div>
              <div 
                className="metric-item"
                style={{ cursor: 'pointer' }}
                onClick={() => window.open(IOS_DEVICE_MONITOR_BASE, '_blank')}
              >
                <div className="metric-label">ตรวจสอบแล้ว (Active)</div>
                <div className="metric-value highlight-success">{monitoredActive} เครื่อง</div>
              </div>
              <div 
                className="metric-item"
                style={{ cursor: 'pointer' }}
                onClick={() => window.open(IOS_DEVICE_MONITOR_BASE, '_blank')}
              >
                <div className="metric-label">ใกล้ครบกำหนด (&le;7 วัน)</div>
                <div className="metric-value highlight-warning">{monitoredWarning} เครื่อง</div>
              </div>
              <div 
                className="metric-item"
                style={{ cursor: 'pointer' }}
                onClick={() => window.open(IOS_DEVICE_MONITOR_BASE, '_blank')}
              >
                <div className="metric-label">ค้างการตรวจสอบ (Action Required)</div>
                <div className="metric-value highlight-danger">{monitoredUnverified} เครื่อง</div>
              </div>
            </div>
          </article>

          {/* CARD 1: ASSETS */}
          <article className="card asset-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><Laptop size={18} style={{ color: 'var(--primary)' }} /></span>
                ทรัพย์สินและอุปกรณ์ (Asset)
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => setActiveModal('assetsList')} 
                  className="btn-details"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)' }}
                >
                  ดูทะเบียนอุปกรณ์
                </button>
                <button 
                  onClick={() => setActiveModal('expiringAssets')} 
                  className="btn-details"
                >
                  ดูข้อมูลหมดอายุ
                </button>
              </div>
            </div>
            <div className="metrics-row">
              <div className="metric-item full-width">
                <div className="asset-total-summary">
                  <div>
                    <div className="metric-label">จำนวนอุปกรณ์ทั้งหมด</div>
                    <div className="metric-value highlight-primary">{warehouseTotalCount.toLocaleString()} เครื่อง</div>
                  </div>
                  <div className="asset-vacant-summary">
                    <div className="metric-label">เครื่องว่าง</div>
                    <div className="metric-value highlight-success">{vacantStockCount} เครื่อง</div>
                    <div className="vacant-assets-breakdown">
                      {vacantStockBreakdown.length > 0 ? vacantStockBreakdown.map((asset) => (
                        <span key={asset.label}>{asset.label} <strong>{asset.count}</strong></span>
                      )) : (
                        <span>ไม่มีเครื่องว่าง</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="main-assets-breakdown">
                  {mainAssetBreakdown.map((asset) => (
                    <div className="main-asset-count" key={asset.label}>
                      <span>{asset.label}</span>
                      <strong>{asset.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="metric-item full-width">
                <div className="metric-label">มูลค่าทรัพย์สิน IT รวม</div>
                <div className="metric-value">{formatThaiBaht(calculatedAssetValue)}</div>
                <div className="metric-note">ราคาตลาดที่มีแหล่งอ้างอิง {pricedAssets.length} จาก {warehouseTotalCount} เครื่อง</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">ใกล้หมดอายุ</div>
                <div className="metric-value highlight-warning">{primaryExpiringAssets} เครื่อง</div>
                <div className="metric-note">Notebook/PC อายุ 3 ปี อ้างอิงปีที่ผลิต</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">เครื่องว่าง (พร้อมใช้)</div>
                <div className="metric-value highlight-success">{vacantStockCount} เครื่อง</div>
                <div className="metric-note">ตามสถานะว่างในทะเบียนคลัง</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">ชำรุด</div>
                <div className="metric-value highlight-danger">{warehouseBrokenCount} เครื่อง</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">สูญหาย</div>
                <div className="metric-value highlight-danger">{warehouseLostCount} เครื่อง</div>
              </div>
            </div>
            <div className="card-chart-container">
              <canvas ref={assetCanvasRef}></canvas>
            </div>
          </article>

          {/* CARD 2: SUPPORT */}
          <article className="card support-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><Ticket size={18} style={{ color: 'var(--violet)' }} /></span>
                การสนับสนุนผู้ใช้ (Support)
              </h3>
              <button 
                onClick={() => setActiveModal('ticketsList')} 
                className="btn-details"
              >
                ดูรายละเอียด
              </button>
            </div>
            <div className="metrics-row">
              <div className="metric-item">
                <div className="metric-label">จำนวน Ticket ทั้งหมด</div>
                <div className="metric-value highlight-primary">{activeData.ticketsCount.toLocaleString()} ใบ</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">สถิติ SLA Compliance</div>
                <div className="metric-value highlight-success">{activeData.slaPercent}%</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Response Time เฉลี่ย</div>
                <div className="metric-value">{activeData.responseTime} นาที</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Resolution Time เฉลี่ย</div>
                <div className="metric-value">{activeData.resolutionTime} ชม.</div>
              </div>
              <div className="metric-item full-width">
                <div className="metric-label">คะแนนความพึงพอใจผู้ใช้ (CSAT)</div>
                <div className="metric-value highlight-warning">{activeData.csat.toFixed(1)} / 5.0</div>
              </div>
            </div>
          </article>

          {/* CARD 3: SOFTWARE */}
          <article className="card software-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><FileCode size={18} style={{ color: 'var(--secondary)' }} /></span>
                ซอฟต์แวร์และลิขสิทธิ์ (Software)
              </h3>
              <button 
                onClick={() => setActiveModal('expiringSoftware')}
                className="btn-details"
              >
                {isAdmin ? 'ดูรายละเอียด / แก้ไข' : 'ดูรายละเอียด'}
              </button>
            </div>
            <div className="metrics-row">
              <div className="metric-item">
                <div className="metric-label">โปรแกรมทั้งหมด</div>
                <div className="metric-value">{calculatedTotalSoftware} โปรแกรม</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">โปรแกรมใกล้หมดสัญญา</div>
                <div className="metric-value highlight-danger">{activeData.softwareExpiring} โปรแกรม</div>
              </div>
              <div
                className="metric-item"
                role="button"
                tabIndex={0}
                onClick={() => setActiveModal('expiringSoftware')}
                onKeyDown={(event) => event.key === 'Enter' && setActiveModal('expiringSoftware')}
                style={{ cursor: 'pointer' }}
                title="คลิกเพื่อดูรายละเอียด License ใช้งาน"
              >
                <div className="metric-label">License ใช้งาน</div>
                <div className="metric-value highlight-primary">{calculatedLicensesInUse.toLocaleString()} Core/User</div>
              </div>
              <div
                className="metric-item"
                role="button"
                tabIndex={0}
                onClick={() => setActiveModal('expiringSoftware')}
                onKeyDown={(event) => event.key === 'Enter' && setActiveModal('expiringSoftware')}
                style={{ cursor: 'pointer' }}
                title="คลิกเพื่อดูรายละเอียด License ว่าง"
              >
                <div className="metric-label">License ว่าง</div>
                <div className="metric-value highlight-secondary">{calculatedLicensesVacant.toLocaleString()} Core/User</div>
              </div>
              <div className="metric-item full-width">
                <div className="metric-label">ค่าใช้จ่ายซอฟต์แวร์รวมรายเดือน</div>
                <div className="metric-value">{formatThaiBaht(calculatedSoftwareCost)}</div>
              </div>
              <div className="metric-item full-width">
                <div className="metric-label">ค่าใช้จ่ายซอฟต์แวร์รวมรายปี</div>
                <div className="metric-value">{formatThaiBaht(calculatedSoftwareAnnualCost)}</div>
              </div>
            </div>
            <div className="card-chart-container">
              <canvas ref={softwareCanvasRef}></canvas>
            </div>
          </article>

          {/* CARD 4: CYBER SECURITY */}
          <article className="card security-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><ShieldCheck size={18} style={{ color: 'var(--success)' }} /></span>
                ความปลอดภัยข้อมูล (Security)
              </h3>
              <button
                type="button"
                onClick={() => isAdmin ? openEditModal() : setActiveModal('securityDetails')}
                className="btn-details"
              >
                {isAdmin ? 'รายละเอียด / แก้ไข' : 'ดูรายละเอียด'}
              </button>
            </div>
            <div className="metrics-row">
              <div className="metric-item full-width">
                <div className="metric-label">Security Incident (เหตุการณ์คุกคาม)</div>
                <div className={`metric-value ${activeData.securityIncidents > 0 ? 'highlight-danger' : 'highlight-success'}`}>
                  {activeData.securityIncidents} ครั้ง
                </div>
              </div>
            </div>
            <div className="gauges-container">
              <CircularProgress value={activeData.backupSuccess} label="Backup สำเร็จ" />
              <CircularProgress value={activeData.antivirusCoverage} label="Antivirus Coverage" />
              <CircularProgress value={activeData.mfaCoverage} label="MFA Coverage" />
            </div>
          </article>

          {/* CARD 5: REPAIR & COST */}
          <article className="card repair-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><Wrench size={18} style={{ color: 'var(--warning)' }} /></span>
                การซ่อมบำรุงและแผนก (Repair)
              </h3>
              <button 
                onClick={() => setActiveModal('topBrokenDevices')} 
                className="btn-details"
              >
                ดู Top 10 เสียบ่อย
              </button>
            </div>
            <div className="metrics-row">
              <div className="metric-item">
                <div className="metric-label">จำนวนงานซ่อม</div>
                <div className="metric-value highlight-warning">{activeData.repairCount} ครั้ง</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">ค่าซ่อมบำรุงสะสม</div>
                <div className="metric-value">{formatThaiBaht(activeData.repairCost)}</div>
              </div>
            </div>
            <div className="card-chart-container">
              <canvas ref={repairCanvasRef}></canvas>
            </div>
            <div className="repair-list-summary">
              <div className="metric-label" style={{ marginBottom: '2px' }}>อุปกรณ์แจ้งซ่อมสูงสุด 3 อันดับแรก:</div>
              {activeData.topBrokenDevices.filter(d => d.count > 0).slice(0, 3).map((device, idx) => (
                <div key={idx} className="repair-list-item">
                  <span className="repair-item-name">{device.name}</span>
                  <span className="repair-item-count">{device.count} เครื่อง</span>
                </div>
              ))}
              {activeData.topBrokenDevices.filter(d => d.count > 0).length === 0 && (
                <div className="repair-list-item">
                  <span className="repair-item-name">ไม่มีประวัติอุปกรณ์ชำรุดในเดือนนี้</span>
                </div>
              )}
            </div>
          </article>

          {/* CARD 6: IMPROVEMENT */}
          <article className="card improvement-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><Lightbulb size={18} style={{ color: 'var(--danger)' }} /></span>
                การปรับปรุงและเทคโนโลยี (Improvement)
              </h3>
            </div>
            <div className="metrics-row">
              <div className="metric-item">
                <div className="metric-label">Automation ที่ทำเสร็จ</div>
                <div className="metric-value highlight-primary">{improvementMetrics.automationsDone} รายการ</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">AI ที่นำมาประยุกต์ใช้</div>
                <div className="metric-value highlight-secondary">{improvementMetrics.aiApps} โมเดล</div>
              </div>
              <div className="metric-item full-width">
                <div className="metric-label">ประหยัดชั่วโมงการทำงาน</div>
                <div className="metric-value highlight-success">{improvementMetrics.hoursSaved.toLocaleString()} ชั่วโมง/เดือน</div>
              </div>
            </div>
            <div className="project-list">
              <div className="metric-label" style={{ marginBottom: '2px' }}>โครงการหลักที่กำลังดำเนินการ:</div>
              {activeData.ongoingProjects.map((proj, idx) => (
                <div key={idx} className="project-item">
                  <div className="project-item-title">{proj.title}</div>
                  <div className="project-item-desc">
                    {proj.desc}
                    {proj.projectType && ` • ${proj.projectType} • ${proj.status} • คืบหน้า ${Number(proj.progress || 0)}%`}
                  </div>
                </div>
              ))}
            </div>
          </article>

        </section>

        {/* BOTTOM SECTION: RECOMMENDATIONS */}
        <section className="card recommendation-card">
          <h3 className="card-title" style={{ color: 'white', marginBottom: '12px' }}>
            <span className="card-icon"><Lightbulb size={18} style={{ color: '#fff' }} /></span>
            ข้อเสนอแนะและแนวทางปฏิบัติ (Recommendation)
          </h3>
          <div className="recommendation-content">
            {activeData.recommendations.length > 0 ? (
              <ul className="recommendation-list">
                {activeData.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p>ไม่มีข้อเสนอแนะเพิ่มเติมสำหรับเดือนนี้ ระบบอยู่ในเกณฑ์ปกติ</p>
            )}
          </div>
        </section>
      </main>

      {activeModal === 'userAccess' && (
        <UserAccessManager currentUser={currentUser} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'securityDetails' && (
        <div className="modal-overlay active">
          <div className="modal large">
            <header className="modal-header">
              <h3>รายละเอียดความปลอดภัยข้อมูล ({activeData.monthName})</h3>
              <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
            </header>
            <div className="modal-body">
              <div className="metrics-row">
                <div className="metric-item"><div className="metric-label">Security Incident</div><div className={`metric-value ${activeData.securityIncidents > 0 ? 'highlight-danger' : 'highlight-success'}`}>{activeData.securityIncidents} ครั้ง</div></div>
                <div className="metric-item"><div className="metric-label">Backup สำเร็จ</div><div className="metric-value highlight-primary">{activeData.backupSuccess}%</div></div>
                <div className="metric-item"><div className="metric-label">Antivirus Coverage</div><div className="metric-value highlight-warning">{activeData.antivirusCoverage}%</div></div>
                <div className="metric-item"><div className="metric-label">MFA Coverage</div><div className="metric-value highlight-success">{activeData.mfaCoverage}%</div></div>
              </div>
              <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>บัญชีนี้เป็นสิทธิ์อ่านอย่างเดียว สามารถดูข้อมูลได้ แต่ไม่สามารถแก้ไขข้อมูล Dashboard</p>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'projectRegistry' && (
        <div className="modal-overlay active">
          <div className="modal large dashboard-fullscreen-modal">
            <header className="modal-header">
              <h3>ขึ้นระบบโปรเจกต์ ({activeData.monthName})</h3>
              <button onClick={() => { resetProjectForm(); setActiveModal(null); }} className="modal-close"><X size={20} /></button>
            </header>
            <div className="modal-body">
              <form onSubmit={saveProject} className="software-license-form">
                <div className="form-grid">
                  <div className="form-group"><label>ชื่อโปรเจกต์</label><input required value={projectForm.title} onChange={event => setProjectForm(previous => ({ ...previous, title: event.target.value }))} /></div>
                  <div className="form-group"><label>ประเภทโปรเจกต์</label><select value={projectForm.projectType} onChange={event => setProjectForm(previous => ({ ...previous, projectType: event.target.value }))}><option>ระบบงาน</option><option>Software</option><option>Automation</option><option>AI</option><option>Infrastructure</option><option>AI &amp; Infrastructure</option><option>Security</option><option>อื่นๆ</option></select></div>
                  <div className="form-group"><label>ผู้รับผิดชอบ</label><input value={projectForm.owner} onChange={event => setProjectForm(previous => ({ ...previous, owner: event.target.value }))} /></div>
                  <div className="form-group"><label>สถานะ</label><select value={projectForm.status} onChange={event => setProjectForm(previous => ({ ...previous, status: event.target.value }))}><option>วางแผน</option><option>กำลังดำเนินการ</option><option>ทดสอบระบบ</option><option>เสร็จสิ้น</option><option>พักโครงการ</option><option>ยกเลิก</option></select></div>
                  <div className="form-group"><label>ความคืบหน้า (%)</label><input type="number" min="0" max="100" value={projectForm.progress} onChange={event => setProjectForm(previous => ({ ...previous, progress: event.target.value }))} /></div>
                  <div className="form-group"><label>ประหยัดเวลาทำงาน (ชั่วโมง/เดือน)</label><input type="number" min="0" value={projectForm.hoursSaved} onChange={event => setProjectForm(previous => ({ ...previous, hoursSaved: event.target.value }))} /></div>
                  <div className="form-group"><label>วันที่เริ่ม</label><input type="date" value={projectForm.startDate} onChange={event => setProjectForm(previous => ({ ...previous, startDate: event.target.value }))} /></div>
                  <div className="form-group"><label>วันที่เป้าหมาย</label><input type="date" value={projectForm.targetDate} onChange={event => setProjectForm(previous => ({ ...previous, targetDate: event.target.value }))} /></div>
                  <div className="form-group full-width"><label>รายละเอียดโปรเจกต์</label><textarea rows="3" required value={projectForm.desc} onChange={event => setProjectForm(previous => ({ ...previous, desc: event.target.value }))} /></div>
                </div>
                <div className="software-license-actions">
                  {editingProjectIndex !== null && <button type="button" className="btn-details" onClick={resetProjectForm}>ยกเลิกการแก้ไข</button>}
                  <button type="submit" className="btn-save">{editingProjectIndex === null ? 'เพิ่มโปรเจกต์' : 'บันทึกการแก้ไข'}</button>
                </div>
              </form>
              <div className="vendor-contract-summary">
                <span>ทั้งหมด <strong>{activeData.ongoingProjects.length.toLocaleString()}</strong> โปรเจกต์</span>
                <span>ประหยัดเวลา <strong>{improvementMetrics.hoursSaved.toLocaleString()}</strong> ชั่วโมง/เดือน</span>
              </div>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="details-table">
                  <thead><tr><th>โปรเจกต์</th><th>ประเภท</th><th>ผู้รับผิดชอบ</th><th>สถานะ</th><th>คืบหน้า</th><th>ประหยัดเวลา</th><th>ช่วงดำเนินการ</th><th>รายละเอียด</th><th>จัดการ</th></tr></thead>
                  <tbody>
                    {activeData.ongoingProjects.length ? activeData.ongoingProjects.map((project, index) => (
                      <tr key={`${project.title}-${index}`}>
                        <td><strong>{project.title}</strong></td><td>{project.projectType || '-'}</td><td>{project.owner || '-'}</td><td>{project.status || 'กำลังดำเนินการ'}</td><td>{Number(project.progress || 0)}%</td><td>{Number(project.hoursSaved || 0).toLocaleString()} ชม./เดือน</td><td>{project.startDate || '-'} ถึง {project.targetDate || '-'}</td><td>{project.desc || '-'}</td>
                        <td><div className="software-row-actions"><button type="button" className="btn-details" onClick={() => editProject(project, index)}>แก้ไข</button><button type="button" className="console-delete-btn" onClick={() => deleteProject(index)}>ลบ</button></div></td>
                      </tr>
                    )) : <tr><td colSpan="9" style={{ textAlign: 'center' }}>ยังไม่มีข้อมูลโปรเจกต์ในเดือนนี้</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'vendorContracts' && (
        <div className="modal-overlay active">
          <div className="modal large dashboard-fullscreen-modal vendor-contract-modal">
            <header className="modal-header">
              <h3>ทะเบียน Vendor Contract ({activeData.monthName})</h3>
              <button onClick={() => { resetVendorContractForm(); setActiveModal(null); }} className="modal-close"><X size={20} /></button>
            </header>
            <div className="modal-body">
              <form onSubmit={saveVendorContract} className="software-license-form">
                <div className="form-grid">
                  <div className="form-group"><label>Vendor</label><input required value={vendorContractForm.vendor} onChange={event => setVendorContractForm(previous => ({ ...previous, vendor: event.target.value }))} /></div>
                  <div className="form-group"><label>บริการ / ขอบเขตงาน</label><input required value={vendorContractForm.service} onChange={event => setVendorContractForm(previous => ({ ...previous, service: event.target.value }))} /></div>
                  <div className="form-group"><label>เลขที่สัญญา</label><input value={vendorContractForm.contractNo} onChange={event => setVendorContractForm(previous => ({ ...previous, contractNo: event.target.value }))} /></div>
                  <div className="form-group"><label>ผู้ติดต่อ</label><input value={vendorContractForm.contact} onChange={event => setVendorContractForm(previous => ({ ...previous, contact: event.target.value }))} /></div>
                  <div className="form-group"><label>วันเริ่มสัญญา</label><input type="date" value={vendorContractForm.startDate} onChange={event => setVendorContractForm(previous => ({ ...previous, startDate: event.target.value }))} /></div>
                  <div className="form-group"><label>วันสิ้นสุดสัญญา</label><input type="date" value={vendorContractForm.endDate} onChange={event => setVendorContractForm(previous => ({ ...previous, endDate: event.target.value }))} /></div>
                  <div className="form-group"><label>รอบชำระเงิน</label><select value={vendorContractForm.billingCycle} onChange={event => setVendorContractForm(previous => ({ ...previous, billingCycle: event.target.value }))}><option>รายเดือน</option><option>รายไตรมาส</option><option>รายปี</option><option>ครั้งเดียว</option></select></div>
                  <div className="form-group"><label>มูลค่า (บาท)</label><input type="number" min="0" value={vendorContractForm.amount} onChange={event => setVendorContractForm(previous => ({ ...previous, amount: event.target.value }))} /></div>
                  <div className="form-group"><label>สถานะ</label><select value={vendorContractForm.status} onChange={event => setVendorContractForm(previous => ({ ...previous, status: event.target.value }))}><option>ใช้งาน</option><option>รอต่อสัญญา</option><option>สิ้นสุด</option><option>ยกเลิก</option></select></div>
                  <div className="form-group"><label>หมายเหตุ</label><input value={vendorContractForm.notes} onChange={event => setVendorContractForm(previous => ({ ...previous, notes: event.target.value }))} /></div>
                </div>
                <div className="software-license-actions">
                  {editingVendorContractIndex !== null && <button type="button" className="btn-details" onClick={resetVendorContractForm}>ยกเลิกการแก้ไข</button>}
                  <button type="submit" className="btn-save">{editingVendorContractIndex === null ? 'เพิ่ม Vendor Contract' : 'บันทึกการแก้ไข'}</button>
                </div>
              </form>
              <div className="vendor-contract-summary">
                <span>ทั้งหมด <strong>{(activeData.vendorContracts || []).length.toLocaleString()}</strong> สัญญา</span>
                <span>มูลค่ารวม <strong>{formatThaiBaht((activeData.vendorContracts || []).reduce((sum, contract) => sum + Number(contract.amount || 0), 0))}</strong></span>
              </div>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="details-table">
                  <thead><tr><th>Vendor</th><th>บริการ</th><th>เลขที่สัญญา</th><th>ระยะสัญญา</th><th>รอบชำระ</th><th>มูลค่า</th><th>ผู้ติดต่อ</th><th>สถานะ</th><th>หมายเหตุ</th><th>จัดการ</th></tr></thead>
                  <tbody>
                    {(activeData.vendorContracts || []).length ? (activeData.vendorContracts || []).map((contract, index) => (
                      <tr key={`${contract.vendor}-${contract.contractNo}-${index}`}>
                        <td><strong>{contract.vendor}</strong></td><td>{contract.service}</td><td>{contract.contractNo || '-'}</td><td>{contract.startDate || '-'} ถึง {contract.endDate || '-'}</td><td>{contract.billingCycle || '-'}</td><td>{formatThaiBaht(contract.amount || 0)}</td><td>{contract.contact || '-'}</td><td>{contract.status || '-'}</td><td>{contract.notes || '-'}</td>
                        <td><div className="software-row-actions"><button type="button" className="btn-details" onClick={() => editVendorContract(contract, index)}>แก้ไข</button><button type="button" className="console-delete-btn" onClick={() => deleteVendorContract(index)}>ลบ</button></div></td>
                      </tr>
                    )) : <tr><td colSpan="10" style={{ textAlign: 'center' }}>ยังไม่มี Vendor Contract ในเดือนนี้</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'operationsLog' && (() => {
        const workflowLabels = { checkout: 'เบิก', replacement: 'เปลี่ยนอุปกรณ์', resignation: 'ลาออก' };
        const statusLabels = { pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', issued: 'ส่งมอบแล้ว', overdue: 'เกินกำหนด', return_requested: 'รอ IT ตรวจรับ', returned: 'คืนแล้ว', rejected: 'ไม่อนุมัติ', need_info: 'รอข้อมูลเพิ่ม' };
        const checklistRows = assetRequests;
        const returnRows = assetRequests.filter(request => ['return_requested', 'returned'].includes(request.status));
        const incidentRows = assetRequests.filter(request => request.workflow_type === 'replacement' || ['ชำรุด', 'สูญหาย'].includes(request.return_condition));
        const rows = operationsLogView === 'returns' ? returnRows : operationsLogView === 'incidents' ? incidentRows : checklistRows;
        return (
          <div className="modal-overlay active">
            <div className="modal large dashboard-fullscreen-modal asset-workflow-modal">
              <header className="modal-header">
                <div><h3>Checklist / Asset Return / Incident</h3><p className="workflow-subtitle">ข้อมูลนับจากรายการเบิกและคืนอุปกรณ์ในระบบ</p></div>
                <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
              </header>
              <div className="modal-body">
                <div className="return-view-switch" style={{ marginBottom: '16px' }}>
                  <button className={operationsLogView === 'checklist' ? 'active' : ''} onClick={() => setOperationsLogView('checklist')}>Checklist ({checklistRows.length})</button>
                  <button className={operationsLogView === 'returns' ? 'active' : ''} onClick={() => setOperationsLogView('returns')}>Asset Return ({returnRows.length})</button>
                  <button className={operationsLogView === 'incidents' ? 'active' : ''} onClick={() => setOperationsLogView('incidents')}>Incident ({incidentRows.length})</button>
                </div>
                <div className="workflow-table-wrap">
                  <table className="details-table workflow-table">
                    <thead><tr><th>เลขที่</th><th>พนักงาน/แผนก</th><th>ประเภท</th><th>อุปกรณ์</th><th>วันที่เบิก</th><th>วันที่คืน</th><th>สภาพคืน</th><th>สถานะ</th><th>หมายเหตุ</th></tr></thead>
                    <tbody>{rows.length === 0 ? <tr><td colSpan="9" className="workflow-empty">ไม่มีรายการ</td></tr> : rows.map(request => (
                      <tr key={request.id}>
                        <td>#{request.id}</td><td><strong>{request.requester}</strong><small>{request.department}</small></td>
                        <td>{workflowLabels[request.workflow_type] || 'เบิก'}</td><td>{request.device_serial || request.item_type || '-'}</td>
                        <td>{request.issue_date ? String(request.issue_date).slice(0, 10) : request.requested_date ? String(request.requested_date).slice(0, 10) : '-'}</td>
                        <td>{request.return_date ? String(request.return_date).slice(0, 10) : '-'}</td><td>{request.return_condition || '-'}</td>
                        <td>{statusLabels[request.status] || request.status}</td><td>{request.notes || '-'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeModal === 'assetWorkflow' && (() => {
        const statusLabels = {
          pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', rejected: 'ไม่อนุมัติ',
          issued: 'ส่งมอบแล้ว', overdue: 'เกินกำหนด', return_requested: 'รอ IT ตรวจรับ', returned: 'คืนแล้ว', need_info: 'รอข้อมูลเพิ่ม'
        };
        const requesterSearch = assetRequesterSearch.trim().toLocaleLowerCase('th-TH');
        const itUsageStatuses = ['pending', 'need_info', 'approved', 'issued', 'overdue'];
        const displayedRequests = assetWorkflowRole === 'it'
          ? assetRequests.filter(request => itUsageStatuses.includes(request.status))
          : (!requesterSearch
              ? assetRequests
              : assetRequests.filter(request => request.requester?.toLocaleLowerCase('th-TH').includes(requesterSearch)));
        return (
          <div className="modal-overlay active">
            <div className="modal large dashboard-fullscreen-modal asset-workflow-modal">
              <header className="modal-header">
                <div>
                  <h3>{assetWorkflowRole === 'it' ? '🛡️ IT อนุมัติการใช้งานและส่งมอบ' : '🙋 ผู้ขอใช้บริการอุปกรณ์ IT'}</h3>
                  <p className="workflow-subtitle">{assetWorkflowRole === 'it' ? 'ตรวจสอบคำขอ → อนุมัติและเลือกเครื่อง → ส่งมอบเพื่อใช้งาน' : 'ส่งคำขอใหม่และติดตามสถานะการใช้งาน'}</p>
                </div>
                <div className="workflow-header-actions">
                  <div className="workflow-role-switch">
                    <button className={assetWorkflowRole === 'requester' ? 'active' : ''} onClick={() => setAssetWorkflowRole('requester')}>ผู้ขอใช้บริการ</button>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
                </div>
              </header>
              <div className={`modal-body workflow-body workflow-role-${assetWorkflowRole}`}>
                {assetWorkflowRole === 'requester' && <form className="workflow-request-form" onSubmit={submitAssetRequest}>
                  <div className="workflow-section-heading">
                    <h4>สร้างคำขอเบิกอุปกรณ์</h4>
                    <span>ระบุได้หลายเครื่อง โดยคั่นหมายเลขด้วยจุลภาคหรือขึ้นบรรทัดใหม่</span>
                  </div>
                  <div className="workflow-form-grid">
                    <label>ชื่อผู้ขอ <input required value={assetRequestForm.requester} onChange={e => setAssetRequestForm(p => ({ ...p, requester: e.target.value }))} /></label>
                    <label>แผนก <input required value={assetRequestForm.department} onChange={e => setAssetRequestForm(p => ({ ...p, department: e.target.value }))} /></label>
                    <label>หมายเลขเครื่อง / ประเภทอุปกรณ์ <textarea required rows="2" placeholder="เช่น iPad-006, iPad-007" value={assetRequestForm.itemType} onChange={e => setAssetRequestForm(p => ({ ...p, itemType: e.target.value }))} /></label>
                    <label>วันที่เบิก <input required type="date" value={assetRequestForm.requestedDate} onChange={e => setAssetRequestForm(p => ({ ...p, requestedDate: e.target.value }))} /></label>
                    <label>ประเภทการดำเนินการ
                      <select required value={assetRequestForm.workflowType} onChange={e => setAssetRequestForm(p => ({ ...p, workflowType: e.target.value }))}>
                        <option value="">-- เลือกทุกครั้ง --</option>
                        <option value="checkout">เบิก</option>
                        <option value="replacement">เปลี่ยนอุปกรณ์</option>
                        <option value="resignation">ลาออก</option>
                      </select>
                    </label>
                    <label className="workflow-span-2">เหตุผลการใช้งาน <textarea required value={assetRequestForm.purpose} onChange={e => setAssetRequestForm(p => ({ ...p, purpose: e.target.value }))} /></label>
                    <label className="workflow-span-2">หมายเหตุ <input value={assetRequestForm.notes} onChange={e => setAssetRequestForm(p => ({ ...p, notes: e.target.value }))} /></label>
                  </div>
                  <button className="workflow-primary-btn" type="submit" disabled={assetRequestLoading}>{assetRequestLoading ? 'กำลังบันทึก...' : 'ส่งคำขอเบิก'}</button>
                </form>}

                <section className="workflow-list-section">
                  <div className="workflow-section-heading">
                    <div>
                      <h4>{assetWorkflowRole === 'it' ? 'รายการรออนุมัติและการใช้งาน' : 'ติดตามคำขอของผู้ใช้บริการ'}</h4>
                      {assetWorkflowRole === 'requester' && <input className="workflow-requester-search" placeholder="ค้นหาด้วยชื่อผู้ขอ" value={assetRequesterSearch} onChange={event => setAssetRequesterSearch(event.target.value)} />}
                    </div>
                    <span>{displayedRequests.length} รายการ{assetWorkflowRole === 'it' ? ` · เครื่องว่าง ${assetsList.filter(asset => asset.status === 'ว่าง').length} เครื่อง` : ''}</span>
                  </div>
                  <div className="workflow-table-wrap">
                    <table className="details-table workflow-table">
                      <thead><tr><th>เลขที่</th><th>ผู้ขอ/แผนก</th><th>อุปกรณ์/เหตุผล</th><th>กำหนดคืน</th><th>เครื่องที่จัดสรร</th><th>สถานะ</th><th>จัดการ</th><th>แก้ไข</th></tr></thead>
                      <tbody>
                        {displayedRequests.length === 0 ? (
                          <tr><td colSpan="8" className="workflow-empty">ยังไม่พบคำขอเบิกอุปกรณ์</td></tr>
                        ) : displayedRequests.map(request => (
                          <tr key={request.id}>
                            <td><strong>#{request.id}</strong><small>{request.requested_date || request.created_at ? new Date(request.requested_date || request.created_at).toLocaleDateString('th-TH') : '-'}</small></td>
                            <td><strong>{request.requester}</strong><small>{request.department}</small></td>
                            <td><strong>{request.item_type}</strong><small>{request.purpose}</small></td>
                            <td>{request.due_date ? String(request.due_date).slice(0, 10) : '-'}</td>
                            <td>{request.device_serial ? <><strong>{request.device_serial}</strong><small>{request.assigned_item_type}</small></> : '-'}</td>
                            <td><span className={`workflow-status status-${request.status}`}>{statusLabels[request.status] || request.status}</span></td>
                            <td>
                              {assetWorkflowRole === 'requester' ? (
                                <span className="workflow-done">-</span>
                              ) : (
                              <div className="workflow-actions">
                                {['pending', 'need_info'].includes(request.status) && <><button onClick={() => runAssetRequestAction(request, 'approve')} disabled={assetRequestLoading}>อนุมัติ/เลือกเครื่อง</button><button className="danger" onClick={() => runAssetRequestAction(request, 'reject')} disabled={assetRequestLoading}>ไม่อนุมัติ</button></>}
                                {request.status === 'approved' && <button onClick={() => runAssetRequestAction(request, 'issue')} disabled={assetRequestLoading}>ส่งมอบ</button>}
                                {['returned', 'rejected'].includes(request.status) && <span className="workflow-done">เสร็จสิ้น</span>}
                                {['issued', 'overdue'].includes(request.status) && <span className="workflow-done">กำลังใช้งาน</span>}
                              </div>
                              )}
                            </td>
                            <td>
                              <button
                                className="workflow-edit-btn"
                                onClick={() => editAssetRequest(request)}
                                disabled={assetRequestLoading}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        );
      })()}

      {activeModal === 'assetReturns' && (() => {
        const statusLabels = {
          pending: 'รออนุมัติ',
          approved: 'รอส่งมอบ',
          issued: 'ส่งมอบแล้ว',
          rejected: 'ไม่อนุมัติ',
          overdue: 'เกินกำหนด',
          return_requested: 'รอ IT ตรวจรับ',
          returned: 'คืนแล้ว'
        };
        const search = assetReturnSearch.trim().toLocaleLowerCase('th-TH');
        const normalizeReturnIdentity = value => String(value || '')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .trim()
          .replace(/\s+/g, ' ')
          .toLocaleLowerCase('th-TH');
        const getReturnIdentityKeys = value => {
          const raw = String(value || '').replace(/[\u200B-\u200D\uFEFF]/g, '');
          const keys = [normalizeReturnIdentity(raw)];
          const nameBeforeNickname = raw.split(/[（(]/, 1)[0];
          keys.push(normalizeReturnIdentity(nameBeforeNickname));
          for (const match of raw.matchAll(/[（(]([^()（）]+)[)）]/g)) {
            keys.push(normalizeReturnIdentity(match[1]));
          }
          return new Set(keys.filter(Boolean));
        };
        const identity = normalizeReturnIdentity(assetReturnIdentity);
        const returnRequests = assetRequests
          .filter(request => ['issued', 'overdue', 'return_requested', 'returned'].includes(request.status))
          .filter(request => {
            if (identity) return getReturnIdentityKeys(request.requester).has(identity);
            if (!search) return false;
            return [
              request.requester,
              request.department,
              request.item_type,
              request.device_serial,
              request.assigned_item_type
            ].some(value => String(value || '').toLocaleLowerCase('th-TH').includes(search));
          })
          .sort((a, b) => {
            const aDone = a.status === 'returned' ? 1 : 0;
            const bDone = b.status === 'returned' ? 1 : 0;
            return aDone - bDone;
          });
        const waitingCount = returnRequests.filter(request => ['issued', 'overdue'].includes(request.status)).length;
        const inspectionRequests = assetRequests.filter(request => request.status === 'return_requested');
        const uniquePositions = Array.from(new Set(assetsList.map(asset => asset.position).filter(Boolean))).sort();
        const uniqueStatuses = Array.from(new Set(assetsList.map(asset => asset.status).filter(Boolean))).sort();
        const registryAssets = assetsList.filter(asset => {
          const query = assetSearch.toLocaleLowerCase('th-TH');
          const matchesSearch = [
            asset.sn,
            asset.date,
            asset.user,
            asset.position,
            asset.itemType,
            asset.deviceSerial,
            asset.additionalEquipment,
            asset.additionalSerial,
            asset.softwareApp,
            asset.registeredEmail,
            asset.returnDueDate,
            asset.status,
            asset.notes,
            asset.inspectionDate,
            asset.purchaseDate,
            asset.productionYear,
            asset.warrantyEndDate,
            asset.expense
          ].some(value => String(value || '').toLocaleLowerCase('th-TH').includes(query));
          return matchesSearch
            && (!assetDeptFilter || asset.position === assetDeptFilter)
            && (!assetStatusFilter || asset.status === assetStatusFilter);
        });

        return (
          <div className="modal-overlay active">
            <div className="modal large dashboard-fullscreen-modal asset-workflow-modal asset-returns-modal">
              <header className="modal-header">
                <div>
                  <h3>↩️ คืนอุปกรณ์</h3>
                  <p className="workflow-subtitle">ค้นหาอุปกรณ์ที่รับไปแล้ว ยืนยันการส่งคืน และตรวจสอบประวัติการคืน</p>
                </div>
                <div className="workflow-header-actions">
                  <div className="return-view-switch">
                    <button className={assetReturnView === 'returns' ? 'active' : ''} onClick={() => setAssetReturnView('returns')}>แจ้งขอคืน</button>
                    <button className={assetReturnView === 'registry' ? 'active' : ''} onClick={() => setAssetReturnView('registry')}>ทะเบียนทรัพย์สินทั้งหมด</button>
                    <button
                      className={assetReturnView === 'inspection' ? 'active it-inspection' : 'it-inspection'}
                      onClick={() => requireAdminAccess(() => setAssetReturnView('inspection'))}
                    >
                      IT ตรวจรับ
                      {inspectionRequests.length > 0 && (
                        <span className="return-tab-count">{inspectionRequests.length}</span>
                      )}
                    </button>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
                </div>
              </header>
              <div className="modal-body">
                {assetReturnView === 'returns' && <section className="workflow-list-section">
                  <div className="workflow-section-heading">
                    <div>
                      <h4>รายการอุปกรณ์ของผู้คืน</h4>
                      <label className="return-identity-field">
                        <span>ยืนยันตัวผู้คืนด้วยชื่อ-นามสกุล หรือชื่อเล่นในวงเล็บ</span>
                        <input
                          className="workflow-requester-search"
                          placeholder="กรอกชื่อ-นามสกุล หรือชื่อเล่น เช่น ปอน"
                          value={assetReturnIdentity}
                          onChange={event => setAssetReturnIdentity(event.target.value)}
                        />
                      </label>
                      <input
                        className="workflow-requester-search"
                        placeholder="ค้นหาแผนกหรือหมายเลขเครื่องของคุณ"
                        value={assetReturnSearch}
                        onChange={event => setAssetReturnSearch(event.target.value)}
                      />
                    </div>
                    <span>รอคืน {waitingCount} รายการ · ทั้งหมด {returnRequests.length} รายการ</span>
                  </div>
                  <div className="workflow-table-wrap">
                    <table className="details-table workflow-table asset-return-table">
                      <thead>
                        <tr>
                          <th>เลขที่</th>
                          <th>ผู้ขอ/แผนก</th>
                          <th>อุปกรณ์ที่รับไป</th>
                          <th>กำหนดคืน</th>
                          <th>สถานะ</th>
                          <th>จัดการคืน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnRequests.length === 0 ? (
                          <tr><td colSpan="6" className="workflow-empty">{
                            identity
                              ? 'ไม่พบอุปกรณ์ที่ตรงกับชื่อผู้คืน'
                              : search
                                ? 'ไม่พบรายการที่ตรงกับคำค้นหา'
                                : 'กรอกชื่อผู้คืน หรือค้นหาด้วยชื่อ แผนก และหมายเลขเครื่อง'
                          }</td></tr>
                        ) : returnRequests.map(request => (
                          <tr key={request.id}>
                            <td>
                              <strong>#{request.id}</strong>
                              <small>{request.requested_date || request.created_at ? new Date(request.requested_date || request.created_at).toLocaleDateString('th-TH') : '-'}</small>
                            </td>
                            <td><strong>{request.requester}</strong><small>{request.department}</small></td>
                            <td>
                              <strong>{request.item_type} {request.device_serial ? `(${request.device_serial})` : ''}</strong>
                              <small>{request.assigned_item_type || request.purpose}</small>
                            </td>
                            <td>{request.due_date ? String(request.due_date).slice(0, 10) : '-'}</td>
                            <td><span className={`workflow-status status-${request.status}`}>{statusLabels[request.status]}</span></td>
                            <td>
                              {['issued', 'overdue'].includes(request.status) ? (
                                <div className="workflow-actions">
                                  <button
                                    className="return"
                                    onClick={() => runAssetRequestAction(request, 'request_return')}
                                    disabled={assetRequestLoading}
                                  >
                                    แจ้งขอคืนอุปกรณ์
                                  </button>
                                </div>
                              ) : request.status === 'return_requested' ? (
                                <span className="workflow-done">รอเจ้าหน้าที่ IT ตรวจรับเครื่อง</span>
                              ) : (
                                <span className="workflow-done">
                                  คืนเมื่อ {request.return_date ? new Date(request.return_date).toLocaleDateString('th-TH') : '-'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>}

                {assetReturnView === 'inspection' && <section className="workflow-list-section return-inspection-section">
                  <div className="workflow-section-heading">
                    <div>
                      <h4>รายการรอเจ้าหน้าที่ IT ตรวจรับ</h4>
                      <p className="workflow-subtitle">ตรวจสภาพเครื่องก่อนยืนยัน ระบบจึงจะเปลี่ยนสถานะคลังเป็น ว่าง / รอซ่อม / สูญหาย</p>
                    </div>
                    <span>รอตรวจรับ {inspectionRequests.length} รายการ</span>
                  </div>
                  <div className="workflow-table-wrap">
                    <table className="details-table workflow-table asset-return-table">
                      <thead>
                        <tr>
                          <th>เลขที่</th>
                          <th>ผู้คืน/แผนก</th>
                          <th>อุปกรณ์</th>
                          <th>กำหนดคืน</th>
                          <th>สถานะ</th>
                          <th>ตรวจรับ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inspectionRequests.length === 0 ? (
                          <tr><td colSpan="6" className="workflow-empty">ไม่มีอุปกรณ์รอตรวจรับ</td></tr>
                        ) : inspectionRequests.map(request => (
                          <tr key={request.id}>
                            <td><strong>#{request.id}</strong><small>{request.requested_date || request.created_at ? new Date(request.requested_date || request.created_at).toLocaleDateString('th-TH') : '-'}</small></td>
                            <td><strong>{request.requester}</strong><small>{request.department}</small></td>
                            <td><strong>{request.device_serial || request.item_type}</strong><small>{request.assigned_item_type || request.purpose}</small></td>
                            <td>{request.due_date ? String(request.due_date).slice(0, 10) : '-'}</td>
                            <td><span className="workflow-status status-return_requested">รอ IT ตรวจรับ</span></td>
                            <td>
                              <div className="workflow-actions">
                                <button className="return" onClick={() => runAssetRequestAction(request, 'return')} disabled={assetRequestLoading}>
                                  ตรวจสภาพและรับคืน
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>}

                {assetReturnView === 'registry' && <section className="workflow-list-section return-registry-section">
                  <div className="workflow-section-heading">
                    <div>
                      <h4>ทะเบียนคลังทรัพย์สินและอุปกรณ์ IT (Asset Registry)</h4>
                      <input
                        className="workflow-requester-search"
                        placeholder="ค้นหาอุปกรณ์ ชื่อผู้ใช้ แผนก หรือหมายเลขเครื่อง"
                        value={assetSearch}
                        onChange={event => setAssetSearch(event.target.value)}
                      />
                    </div>
                    <span>แสดง {registryAssets.length} จากทั้งหมด {assetsList.length} อุปกรณ์</span>
                  </div>
                  <div className="return-registry-filters">
                    <select value={assetDeptFilter} onChange={event => setAssetDeptFilter(event.target.value)}>
                      <option value="">ทั้งหมดแผนก</option>
                      {uniquePositions.map(position => <option key={position} value={position}>{position}</option>)}
                    </select>
                    <select value={assetStatusFilter} onChange={event => setAssetStatusFilter(event.target.value)}>
                      <option value="">ทั้งหมดสถานะ</option>
                      {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="workflow-table-wrap return-registry-table-wrap">
                    <table className="details-table return-registry-table">
                      <thead>
                        <tr>
                          <th>ลำดับที่</th>
                          <th>วันที่เบิกใช้งาน</th>
                          <th>ผู้เบิกใช้งาน</th>
                          <th>ตำแหน่ง/แผนก</th>
                          <th>รายการอุปกรณ์หลัก</th>
                          <th>หมายเลขอุปกรณ์ (Serial)</th>
                          <th>อุปกรณ์เพิ่มเติม</th>
                          <th>หมายเลขอุปกรณ์เพิ่มเติม</th>
                          <th>ซอฟต์แวร์ / App</th>
                          <th>อีเมลที่ลงทะเบียน</th>
                          <th>กำหนดคืน</th>
                          <th>สถานะ</th>
                          <th>หมายเหตุ</th>
                          <th>วันที่ตรวจสอบ</th>
                          <th>วันที่ซื้อ</th>
                          <th>ปีที่ผลิต</th>
                          <th>วันหมดประกัน</th>
                          <th>ค่าใช้จ่าย</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registryAssets.length === 0 ? (
                          <tr><td colSpan="18" className="workflow-empty">ไม่พบอุปกรณ์ที่ตรงตามเงื่อนไข</td></tr>
                        ) : registryAssets.map((asset, index) => (
                          <tr key={asset.sn ?? index}>
                            <td><strong>{index + 1}</strong></td>
                            <td>{asset.date || '-'}</td>
                            <td>{asset.user || '-'}</td>
                            <td>{asset.position || '-'}</td>
                            <td><AssetTags value={asset.itemType} /></td>
                            <td><strong>{asset.deviceSerial || '-'}</strong></td>
                            <td><AssetTags value={asset.additionalEquipment} /></td>
                            <td><AssetTags value={asset.additionalSerial} /></td>
                            <td><AssetTags value={asset.softwareApp} /></td>
                            <td>{asset.registeredEmail || '-'}</td>
                            <td>{asset.returnDueDate || '-'}</td>
                            <td><span className="registry-status">{asset.status || '-'}</span></td>
                            <td>{asset.notes || '-'}</td>
                            <td>{asset.inspectionDate || '-'}</td>
                            <td>{asset.purchaseDate || '-'}</td>
                            <td>{asset.productionYear || '-'}</td>
                            <td>{asset.warrantyEndDate || '-'}</td>
                            <td>{Number(asset.expense || 0).toLocaleString('th-TH')} บาท</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 1: EDIT FORM CONSOLE */}
      {activeModal === 'edit' && (
        <div className="modal-overlay active">
          <div className="modal large">
            <header className="modal-header">
              <h3>✏️ แก้ไขข้อมูลประจำเดือน <span style={{ color: 'var(--primary)' }}>{activeData.monthName}</span></h3>
              <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
            </header>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit}>
                
                {/* Hardware inputs */}
                <div className="form-section">
                  <h4 className="form-section-title">1. ทรัพย์สินและฮาร์ดแวร์ (Assets)</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>จำนวนอุปกรณ์ทั้งหมด (เครื่อง)</label>
                      <input 
                        type="number" 
                        value={formInputs.totalAssets ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, totalAssets: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>มูลค่าทรัพย์สินไอทีรวม (บาท)</label>
                      <input 
                        type="number" 
                        value={formInputs.assetValue ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, assetValue: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>อุปกรณ์ใกล้หมดอายุ (เครื่อง)</label>
                      <input 
                        type="number" 
                        value={formInputs.assetsExpiring ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, assetsExpiring: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>อุปกรณ์ชำรุด (เครื่อง)</label>
                      <input 
                        type="number" 
                        value={formInputs.assetsBroken ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, assetsBroken: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>อุปกรณ์สูญหาย (เครื่อง)</label>
                      <input 
                        type="number" 
                        value={formInputs.assetsLost ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, assetsLost: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>อุปกรณ์ว่าง/พร้อมใช้ (เครื่อง)</label>
                      <input 
                        type="number" 
                        value={formInputs.assetsVacant ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, assetsVacant: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Support inputs */}
                <div className="form-section">
                  <h4 className="form-section-title">2. บริการช่วยเหลือผู้ใช้ (Support)</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>จำนวน Ticket ทั้งหมด (ใบ)</label>
                      <input 
                        type="number" 
                        value={formInputs.ticketsCount ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, ticketsCount: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>สถิติการบรรลุข้อตกลง SLA (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={formInputs.slaPercent ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, slaPercent: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Response Time เฉลี่ย (นาที)</label>
                      <input 
                        type="number" 
                        value={formInputs.responseTime ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, responseTime: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Resolution Time เฉลี่ย (ชั่วโมง)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={formInputs.resolutionTime ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, resolutionTime: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>คะแนนความพึงพอใจผู้ใช้ CSAT (คะแนนเต็ม 5)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        max="5" 
                        value={formInputs.csat ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, csat: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Software inputs */}
                <div className="form-section">
                  <h4 className="form-section-title">3. ลิขสิทธิ์ซอฟต์แวร์ (Software)</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>โปรแกรมซอฟต์แวร์ทั้งหมด</label>
                      <input 
                        type="number" 
                        value={formInputs.totalSoftware ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, totalSoftware: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>โปรแกรมใกล้สัญญาหมดสัญญา</label>
                      <input 
                        type="number" 
                        value={formInputs.softwareExpiring ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, softwareExpiring: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>สิทธิ์/บัญชีใช้งานอยู่ (Licenses)</label>
                      <input 
                        type="number" 
                        value={formInputs.licensesInUse ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, licensesInUse: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>สิทธิ์/บัญชีว่าง (Licenses)</label>
                      <input 
                        type="number" 
                        value={formInputs.licensesVacant ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, licensesVacant: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>ค่าใช้จ่ายซอฟต์แวร์รวม (บาท)</label>
                      <input 
                        type="number" 
                        value={formInputs.softwareCost ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, softwareCost: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>ค่าใช้จ่ายซอฟต์แวร์รวมรายปี (บาท)</label>
                      <input
                        type="number"
                        value={formInputs.softwareAnnualCost ?? ''}
                        onChange={(e) => setFormInputs(p => ({ ...p, softwareAnnualCost: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Security inputs */}
                <div className="form-section">
                  <h4 className="form-section-title">4. ความปลอดภัยข้อมูลและการกู้คืน (Security)</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>การสำรองข้อมูล (Backup) สำเร็จ (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        max="100" 
                        value={formInputs.backupSuccess ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, backupSuccess: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>ภัยคุกคาม Security Incident (ครั้ง)</label>
                      <input 
                        type="number" 
                        value={formInputs.securityIncidents ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, securityIncidents: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>ความคุ้มครองระบบ Antivirus (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        max="100" 
                        value={formInputs.antivirusCoverage ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, antivirusCoverage: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>การเปิดใช้งาน MFA ในระบบหลัก (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        max="100" 
                        value={formInputs.mfaCoverage ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, mfaCoverage: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Repair inputs */}
                <div className="form-section">
                  <h4 className="form-section-title">5. การแจ้งส่งซ่อมและค่าบำรุงรักษา (Repair)</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>จำนวนครั้งการส่งซ่อม</label>
                      <input 
                        type="number" 
                        value={formInputs.repairCount ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, repairCount: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>ค่าซ่อมแซมและบำรุงรักษาอุปกรณ์รวม (บาท)</label>
                      <input 
                        type="number" 
                        value={formInputs.repairCost ?? ''} 
                        onChange={(e) => setFormInputs(p => ({ ...p, repairCost: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Recommendation inputs */}
                <div className="form-section">
                  <h4 className="form-section-title">6. ข้อเสนอแนะและสรุปเชิงผู้บริหาร (Recommendations)</h4>
                  <div className="form-group full-width">
                    <label>ข้อเสนอแนะ (ใส่หนึ่งข้อเสนอแนะต่อ 1 บรรทัด)</label>
                    <textarea 
                      rows="4" 
                      value={formInputs.recommendations || ''} 
                      onChange={(e) => setFormInputs(p => ({ ...p, recommendations: e.target.value }))}
                      placeholder="แนะนำให้ปรับปรุงการ..."
                    ></textarea>
                  </div>
                </div>

                <footer className="form-footer">
                  <button 
                    type="button" 
                    onClick={() => setActiveModal(null)} 
                    className="sidebar-btn secondary" 
                    style={{ width: 'auto', padding: '10px 20px' }}
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit" 
                    className="sidebar-btn" 
                    style={{ width: 'auto', padding: '10px 24px' }}
                  >
                    บันทึกการแก้ไข
                  </button>
                </footer>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EXPIRING HARDWARE LIST */}
      {activeModal === 'expiringAssets' && (
        <div className="modal-overlay active">
          <div className="modal large dashboard-fullscreen-modal">
            <header className="modal-header">
              <h3>รายละเอียดอุปกรณ์ใกล้หมดอายุ ({activeData.monthName})</h3>
              <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
            </header>
            <div className="modal-body">
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>รหัสทรัพย์สิน</th>
                      <th>ประเภท</th>
                      <th>รุ่น</th>
                      <th>ปีที่ผลิต</th>
                      <th>แผนก</th>
                      <th>วันที่หมดอายุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {primaryExpiringAssetDetails.length > 0 ? (
                      primaryExpiringAssetDetails.map((asset, idx) => (
                        <tr key={idx}>
                          <td><strong>{asset.id}</strong></td>
                          <td>{asset.type}</td>
                          <td>{asset.model}</td>
                          <td>{asset.productionYear}</td>
                          <td>{asset.dept}</td>
                          <td><span style={{ color: 'var(--warning)' }}>{asset.expDate}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>ไม่มี Notebook หรือ PC ที่เหลืออายุการใช้งานไม่เกิน 1 ปี</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPIRING SOFTWARE AGREEMENTS */}
      {activeModal === 'expiringSoftware' && (
        <div className="modal-overlay active">
          <div className="modal large software-license-modal dashboard-fullscreen-modal">
            <header className="modal-header">
              <h3>ทะเบียนโปรแกรมและ License ({activeData.monthName})</h3>
              <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
            </header>
            <div className="modal-body">
              {isAdmin && <button
                type="button"
                className="btn-details software-form-toggle"
                onClick={() => setSoftwareFormExpanded(previous => !previous)}
                aria-expanded={softwareFormExpanded}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: softwareFormExpanded ? '10px' : '16px' }}
              >
                {softwareFormExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {softwareFormExpanded ? 'ซ่อนฟอร์มเพิ่ม / แก้ไข License' : 'เปิดฟอร์มเพิ่ม / แก้ไข License'}
              </button>}
              {isAdmin && softwareFormExpanded && <form onSubmit={saveSoftwareLicense} className="software-license-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>ชื่อซอฟต์แวร์/โปรแกรม</label>
                    <input value={softwareName} onChange={(event) => setSoftwareName(event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>วันหมดอายุ</label>
                    <input type="date" value={softwareExpiryDate} onChange={(event) => setSoftwareExpiryDate(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Owner / แผนก</label>
                    <input value={softwareOwner} onChange={(event) => setSoftwareOwner(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>ช่องทางชำระเงิน</label>
                    <input value={softwarePaymentChannel} onChange={(event) => setSoftwarePaymentChannel(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>วันที่/รอบชำระเงิน</label>
                    <input value={softwarePaymentDate} onChange={(event) => setSoftwarePaymentDate(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>อีเมลที่สมัคร</label>
                    <input type="email" value={softwareRegisteredEmail} onChange={(event) => setSoftwareRegisteredEmail(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>License ใช้งาน</label>
                    <input type="number" min="0" value={softwareUsed} onChange={(event) => setSoftwareUsed(event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>License ว่าง</label>
                    <input type="number" min="0" value={softwareVacant} onChange={(event) => setSoftwareVacant(event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>ค่าใช้จ่ายต่อเดือน (บาท)</label>
                    <input type="number" min="0" value={softwareMonthlyCost} onChange={(event) => setSoftwareMonthlyCost(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>ผู้ใช้งานปัจจุบัน (คั่นด้วยจุลภาค)</label>
                    <textarea value={softwareCurrentUsers} onChange={(event) => setSoftwareCurrentUsers(event.target.value)} />
                  </div>
                </div>
                <div className="software-license-actions">
                  <input
                    ref={softwareExcelInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={importSoftwareLicensesFromExcel}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-details"
                    onClick={() => softwareExcelInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={16} />
                    อัปโหลดไฟล์ Excel
                  </button>
                  {editingSoftwareIndex !== null && <button type="button" className="btn-details" onClick={resetSoftwareForm}>ยกเลิก</button>}
                  <button type="submit" className="btn-save">{editingSoftwareIndex === null ? 'เพิ่ม License' : 'บันทึกการแก้ไข'}</button>
                </div>
              </form>}
              <div className="software-license-toolbar">
                <label className="software-license-search">
                  <Search size={17} aria-hidden="true" />
                  <input
                    type="search"
                    value={softwareSearch}
                    onChange={(event) => setSoftwareSearch(event.target.value)}
                    placeholder="ค้นหาชื่อโปรแกรม, Owner, อีเมล, ช่องทางชำระ หรือผู้ใช้งาน"
                    aria-label="ค้นหารายการ License"
                  />
                </label>
                <div className="software-billing-filter" role="group" aria-label="กรองตามรอบชำระเงิน">
                  {[
                    ['all', 'ทั้งหมด'],
                    ['monthly', 'รายเดือน'],
                    ['yearly', 'รายปี'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={softwareBillingFilter === value ? 'active' : ''}
                      onClick={() => setSoftwareBillingFilter(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="software-filter-result">
                  แสดง {filteredSoftwareLicenses.length.toLocaleString()} จาก {(activeData.softwareExpiringDetails || []).length.toLocaleString()} รายการ
                </span>
                <span className="software-price-total">
                  รวมราคา <strong>{formatThaiBaht(filteredSoftwareTotalCost)}</strong>
                </span>
              </div>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>ชื่อซอฟต์แวร์/โปรแกรม</th>
                      <th>Owner</th>
                      <th>ใช้งาน</th>
                      <th>ว่าง</th>
                      <th>รวม</th>
                      <th>ราคา</th>
                      <th>ช่องทางชำระ</th>
                      <th>วันที่ชำระ</th>
                      <th>วันหมดสัญญา</th>
                      <th>อีเมลสมัคร</th>
                      <th>ผู้ใช้งานปัจจุบัน</th>
                      {isAdmin && <th>จัดการ</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSoftwareLicenses.length > 0 ? (
                      filteredSoftwareLicenses.map(({ item: soft, originalIndex }) => (
                        <tr key={originalIndex}>
                          <td><strong>{soft.name}</strong></td>
                          <td>{soft.owner || '-'}</td>
                          <td>{soft.used ?? '-'}</td>
                          <td>{soft.vacant ?? '-'}</td>
                          <td>{soft.licenses ?? (Number(soft.used || 0) + Number(soft.vacant || 0))}</td>
                          <td>{soft.monthlyCost !== undefined ? formatThaiBaht(soft.monthlyCost) : '-'}</td>
                          <td>{soft.paymentChannel || '-'}</td>
                          <td>{soft.paymentDate || '-'}</td>
                          <td>{soft.expiringDate || '-'}</td>
                          <td>{soft.registeredEmail || '-'}</td>
                          <td style={{ minWidth: '160px' }}>{soft.currentUsers || '-'}</td>
                          {isAdmin && <td>
                            <div className="software-row-actions">
                              <button type="button" className="btn-details" onClick={() => editSoftwareLicense(soft, originalIndex)}>แก้ไข</button>
                              <button type="button" className="console-delete-btn" onClick={() => deleteSoftwareLicense(originalIndex)}>ลบ</button>
                            </div>
                          </td>}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin ? 12 : 11} style={{ textAlign: 'center' }}>
                          {(activeData.softwareExpiringDetails || []).length > 0
                            ? 'ไม่พบรายการที่ตรงกับการค้นหาหรือตัวกรอง'
                            : 'ยังไม่มีรายละเอียด License'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="software-total-row">
                      <td colSpan="5">รวมราคา ({filteredSoftwareLicenses.length.toLocaleString()} รายการ)</td>
                      <td>{formatThaiBaht(filteredSoftwareTotalCost)}</td>
                      <td colSpan={isAdmin ? 6 : 5}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: TOP 10 BROKEN DEVICES */}
      {activeModal === 'topBrokenDevices' && (
        <div className="modal-overlay active">
          <div className="modal large">
            <header className="modal-header">
              <h3>ทำเนียบอุปกรณ์ชำรุด (Top 10 อุปกรณ์เสียบ่อย)</h3>
              <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
            </header>
            <div className="modal-body">
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>อันดับ</th>
                      <th>อุปกรณ์/รุ่น</th>
                      <th>จำนวนครั้งที่เสีย</th>
                      <th>ค่าใช้จ่ายในการซ่อมรวม (โดยประมาณ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...activeData.topBrokenDevices].sort((a,b) => b.count - a.count).map((device, idx) => (
                      <tr key={idx}>
                        <td><strong>{idx + 1}</strong></td>
                        <td>{device.name}</td>
                        <td><span className="repair-item-count">{device.count} ครั้ง</span></td>
                        <td>{device.cost > 0 ? formatThaiBaht(device.cost) : '0 บาท'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TICKETS LIST DETAILS */}
      {activeModal === 'appBugReports' && (
        <div className="modal-overlay active">
          <div className="modal large dashboard-fullscreen-modal">
            <header className="modal-header">
              <h3><Bug size={20} /> รายงานบัคระบบ IT Dashboard ({activeData.monthName})</h3>
              <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
            </header>
            <div className="modal-body">
              <div className="app-bug-modal-summary">
                <span>ทั้งหมด <strong>{appBugReports.length}</strong></span>
                <span>กำลังดำเนินการ <strong className="bug-open">{openAppBugReports.length}</strong></span>
                <span>ปิดแล้ว <strong className="bug-closed">{closedAppBugReports}</strong></span>
                <span>ความรุนแรงสูง <strong className="bug-high">{highPriorityAppBugReports}</strong></span>
              </div>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>เลขที่</th>
                      <th>วัน-เวลา</th>
                      <th>ผู้แจ้ง</th>
                      <th>รายละเอียดบัคของ Dashboard</th>
                      <th>สาเหตุ</th>
                      <th>ผู้รับผิดชอบ</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appBugReports.length > 0 ? [...appBugReports].reverse().map(ticket => (
                      <tr key={ticket.sn}>
                        <td><strong>#{ticket.sn}</strong></td>
                        <td>{ticket.date || '-'}</td>
                        <td>{ticket.complainant || '-'}</td>
                        <td>{ticket.issue || '-'}</td>
                        <td>{ticket.cause || '-'}</td>
                        <td>{ticket.responder || '-'}</td>
                        <td>
                          <span className={`app-bug-status ${closedAppBugStatuses.has(String(ticket.status || '').trim().toLocaleLowerCase('th-TH')) ? 'closed' : 'open'}`}>
                            {ticket.status || 'รอดำเนินการ'}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="7" className="workflow-empty">ยังไม่มีรายงานบัคของระบบในเดือนนี้</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'ticketsList' && (
        <div className="modal-overlay active">
          <div className="modal large dashboard-fullscreen-modal">
            <header className="modal-header">
              <h3>รายละเอียดประวัติงานซ่อมและบริการ Support ({activeData.monthName})</h3>
              <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
            </header>
            <div className="modal-body">
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>SN / รหัส</th>
                      <th>วัน-เวลา</th>
                      <th>ผู้แจ้ง / ติดต่อ</th>
                      <th>ปัญหา / อาการเสีย / รายการ</th>
                      <th>สาเหตุการเสีย</th>
                      <th>ผู้รับผิดชอบ (IT)</th>
                      <th>เวลาทำงาน</th>
                      <th>สถานะ</th>
                      <th>ค่าใช้จ่าย (บาท)</th>
                      <th>รูปแนบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.ticketsList && activeData.ticketsList.length > 0 ? (
                      activeData.ticketsList.map((ticket, idx) => (
                        <tr key={idx}>
                          <td><strong>{ticket.sn}</strong></td>
                          <td>{ticket.date}</td>
                          <td>
                            <div><strong>{ticket.complainant || '-'}</strong></div>
                            {ticket.email && ticket.email !== '-' && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.email}</div>}
                            {ticket.anydesk && ticket.anydesk !== '-' && <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>AnyDesk: {ticket.anydesk}</div>}
                          </td>
                          <td>{ticket.issue}</td>
                          <td><span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>{ticket.cause || '-'}</span></td>
                          <td>{ticket.responder}</td>
                          <td>{ticket.duration}</td>
                          <td>
                            <span 
                              style={{ 
                                color: ticket.status === 'เสร็จสิ้น' || ticket.status === 'จ่ายเงินแล้ว' ? 'var(--success)' : 'var(--warning)', 
                                fontWeight: '600' 
                              }}
                            >
                              {ticket.status}
                            </span>
                          </td>
                          <td>{ticket.cost > 0 ? formatThaiBaht(ticket.cost) : '-'}</td>
                          <td>
                            {(ticket.hasAttachment || ticket.attachmentData) ? (
                              <a
                                className="ticket-attachment-link"
                                href={ticket.attachmentData || `${API_BASE}/api/tickets/${ticket.sn}/attachment?v=2&token=${encodeURIComponent(getStoredAuth()?.token || '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={ticket.attachmentName || 'เปิดรูปแนบ'}
                              >
                                <img
                                  src={ticket.attachmentData || `${API_BASE}/api/tickets/${ticket.sn}/attachment?v=2&token=${encodeURIComponent(getStoredAuth()?.token || '')}`}
                                  alt={ticket.attachmentName || `รูปแนบ Ticket ${ticket.sn}`}
                                />
                                <span>ดูรูป</span>
                              </a>
                            ) : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center' }}>ไม่มีข้อมูลประวัติประวัติงานซ่อมสำหรับเดือนนี้</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ASSETS LIST (INVENTORY REGISTRY) */}
      {activeModal === 'assetsList' && (() => {
        const uniquePositions = Array.from(new Set(assetsList.map(a => a.position).filter(Boolean))).sort();
        const uniqueStatuses = Array.from(new Set(assetsList.map(a => a.status).filter(Boolean))).sort();
        const uniqueTypes = Array.from(new Set(assetsList.map(a => a.itemType).filter(Boolean))).sort();

        const filteredAssetsList = assetsList.filter(asset => {
          const matchesSearch = 
            String(asset.user).toLowerCase().includes(assetSearch.toLowerCase()) ||
            String(asset.itemType).toLowerCase().includes(assetSearch.toLowerCase()) ||
            String(asset.deviceSerial).toLowerCase().includes(assetSearch.toLowerCase()) ||
            String(asset.additionalEquipment || '').toLowerCase().includes(assetSearch.toLowerCase()) ||
            String(asset.additionalSerial || '').toLowerCase().includes(assetSearch.toLowerCase()) ||
            String(asset.softwareApp || '').toLowerCase().includes(assetSearch.toLowerCase()) ||
            String(asset.registeredEmail || '').toLowerCase().includes(assetSearch.toLowerCase()) ||
            String(asset.position).toLowerCase().includes(assetSearch.toLowerCase());
            
          const matchesDept = !assetDeptFilter || asset.position === assetDeptFilter;
          const matchesStatus = !assetStatusFilter || asset.status === assetStatusFilter;
          const matchesType = !assetTypeFilter || asset.itemType === assetTypeFilter;
          
          return matchesSearch && matchesDept && matchesStatus && matchesType;
        });

        return (
          <div className="modal-overlay active">
            <div className="modal large dashboard-fullscreen-modal asset-list-modal">
              <header className="modal-header">
                <h3>ทะเบียนคลังทรัพย์สินและอุปกรณ์ IT (Asset Registry)</h3>
                <button onClick={() => {
                  setActiveModal(null);
                  setAssetSearch('');
                  setAssetDeptFilter('');
                  setAssetStatusFilter('');
                  setAssetTypeFilter('');
                }} className="modal-close"><X size={20} /></button>
              </header>
              <div className="modal-body asset-list-modal-body">
                {/* Search & Filters Bar */}
                <div className="asset-filter-bar" style={{
                  marginBottom: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div className="asset-filter-item">
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ค้นหาอุปกรณ์ / ชื่อผู้เบิก / หมายเลขเครื่อง</label>
                    <input 
                      type="text"
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                      placeholder="เช่น Lenovo, ชื่อพนักงาน, LENOVO-010..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        color: 'white'
                      }}
                    />
                  </div>
                  <div className="asset-filter-item">
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>กรองตามประเภท</label>
                    <select
                      value={assetTypeFilter}
                      onChange={(e) => setAssetTypeFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        color: 'white'
                      }}
                    >
                      <option value="">ทั้งหมดประเภท</option>
                      {uniqueTypes.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="asset-filter-item">
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>กรองตามแผนก/ตำแหน่ง</label>
                    <select
                      value={assetDeptFilter}
                      onChange={(e) => setAssetDeptFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        color: 'white'
                      }}
                    >
                      <option value="">ทั้งหมดแผนก</option>
                      {uniquePositions.map((pos, idx) => (
                        <option key={idx} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div className="asset-filter-item-sm">
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>กรองตามสถานะ</label>
                    <select
                      value={assetStatusFilter}
                      onChange={(e) => setAssetStatusFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        color: 'white'
                      }}
                    >
                      <option value="">ทั้งหมดสถานะ</option>
                      {uniqueStatuses.map((stat, idx) => (
                        <option key={idx} value={stat}>{stat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="asset-list-table-wrap">
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>ลำดับที่</th>
                        <th>วันที่เบิกใช้งาน</th>
                        <th>ผู้เบิกใช้งาน</th>
                        <th>ตำแหน่ง/แผนก</th>
                        <th>รายการอุปกรณ์หลัก</th>
                        <th>หมายเลขอุปกรณ์ (Serial)</th>
                        <th>อุปกรณ์เพิ่มเติม</th>
                        <th>หมายเลขอุปกรณ์เพิ่มเติม</th>
                        <th>ซอฟต์แวร์ / App</th>
                        <th>อีเมลที่ลงทะเบียน</th>
                        <th>กำหนดคืน</th>
                        <th>สถานะ</th>
                        <th>หมายเหตุ</th>
                        <th>วันที่ตรวจสอบ</th>
                        <th>วันที่ซื้อ</th>
                        <th>ปีที่ผลิต</th>
                        <th>วันหมดประกัน</th>
                        <th>ค่าใช้จ่าย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssetsList.length > 0 ? (
                        filteredAssetsList.map((asset, idx) => (
                          <tr key={idx}>
                            <td><strong>{idx + 1}</strong></td>
                            <td>{asset.date || '-'}</td>
                            <td>{asset.user}</td>
                            <td>{asset.position}</td>
                            <td><AssetTags value={asset.itemType} /></td>
                            <td><strong>{asset.deviceSerial}</strong></td>
                            <td><AssetTags value={asset.additionalEquipment} /></td>
                            <td><AssetTags value={asset.additionalSerial} /></td>
                            <td><AssetTags value={asset.softwareApp} /></td>
                            <td>{asset.registeredEmail || '-'}</td>
                            <td>{asset.returnDueDate || '-'}</td>
                            <td>
                              <span 
                                style={{ 
                                  color: asset.status === 'ใช้งาน' ? 'var(--success)' : ['รอซ่อม', 'ชำรุด'].includes(asset.status) ? 'var(--danger)' : 'var(--warning)',
                                  fontWeight: '600',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: asset.status === 'ใช้งาน' ? 'rgba(16, 185, 129, 0.1)' : ['รอซ่อม', 'ชำรุด'].includes(asset.status) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                                }}
                              >
                                {asset.status}
                              </span>
                            </td>
                            <td>{asset.notes || '-'}</td>
                            <td>{asset.inspectionDate || '-'}</td>
                            <td>{asset.purchaseDate || '-'}</td>
                            <td>{asset.productionYear || '-'}</td>
                            <td>{asset.warrantyEndDate || '-'}</td>
                            <td>{Number(asset.expense || 0).toLocaleString('th-TH')} บาท</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="19" style={{ textAlign: 'center' }}>ไม่พบคลังอุปกรณ์ที่ตรงตามเงื่อนไข</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="asset-list-table-summary">
                แสดง {filteredAssetsList.length} จากทั้งหมด {assetsList.length} อุปกรณ์
              </div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* MODAL 7: FULL ADMINISTRATIVE DATA CUSTOMIZER PANEL */}
    {activeModal === 'fullConsole' && (() => {
      const consoleMonthData = data[consoleMonth] || {};
      const consoleAssetQuery = consoleAssetSearch.trim().toLocaleLowerCase('th-TH');
      const consoleAssets = assetsList
        .filter((asset) => !consoleAssetQuery || [
          asset.sn, asset.submittedOn, asset.respondent, asset.date, asset.user, asset.position,
          asset.itemType, asset.additionalEquipment, asset.softwareApp, asset.registeredEmail,
          asset.deviceSerial, asset.additionalSerial, asset.returnDueDate, asset.status,
          asset.notes, asset.inspectionDate, asset.purchaseDate, asset.productionYear, asset.warrantyEndDate, asset.expense
        ].some((value) => String(value ?? '').toLocaleLowerCase('th-TH').includes(consoleAssetQuery)))
        .sort((a, b) => String(a.position || '').localeCompare(String(b.position || ''), 'th')
          || Number(a.sn || 0) - Number(b.sn || 0));
      const primaryTagOptions = [...new Set(assetsList.map((asset) => String(asset.itemType || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th'));
      const additionalTagOptions = [...new Set(assetsList.flatMap((asset) => String(asset.additionalEquipment || '').split(/[,\n]+/).map((tag) => tag.trim()).filter(Boolean)))].sort((a, b) => a.localeCompare(b, 'th'));
      
      return (
        <div className="modal-overlay active full-console-overlay">
          <div className={`modal large full-console-modal ${consoleTab === 'assets' ? 'asset-console-mode' : ''}`}>
            <header className="modal-header console-topbar">
              <div className="console-topbar-title">
                <Database size={22} style={{ color: 'var(--primary)' }} />
                <h3>
                  {consoleTab === 'assets'
                    ? <>ทะเบียนคลังทรัพย์สินหลัก (IT Asset Registry Editor) - {editingAssetSn !== null ? <span style={{ color: 'var(--warning)' }}>โหมดแก้ไขรหัส #{editingAssetSn}</span> : <span>โหมดเพิ่มข้อมูล</span>}</>
                    : 'ระบบจัดการและปรับเปลี่ยนข้อมูลแดชบอร์ดทั้งหมด'}
                </h3>
              </div>
              <nav className="console-topbar-nav" aria-label="เมนูจัดการข้อมูลแดชบอร์ด">
                <button onClick={() => setConsoleTab('months')} className={`console-tab-btn ${consoleTab === 'months' ? 'active' : ''}`}>📅 จัดการเดือน</button>
                <button onClick={() => setConsoleTab('kpis')} className={`console-tab-btn ${consoleTab === 'kpis' ? 'active' : ''}`}>📈 ตัวชี้วัด KPIs</button>
                <button onClick={() => setConsoleTab('projects')} className={`console-tab-btn ${consoleTab === 'projects' ? 'active' : ''}`}>🗒️ โครงการ & ข้อแนะนำ</button>
                <button onClick={() => setConsoleTab('assets')} className={`console-tab-btn ${consoleTab === 'assets' ? 'active' : ''}`}>💻 คลังทรัพย์สิน IT</button>
                <button onClick={() => setConsoleTab('tickets')} className={`console-tab-btn ${consoleTab === 'tickets' ? 'active' : ''}`}>🚨 ประวัติงาน Support</button>
                <button onClick={() => setConsoleTab('backup')} className={`console-tab-btn ${consoleTab === 'backup' ? 'active' : ''}`}>💾 สำรอง & รีเซ็ตระบบ</button>
              </nav>
              {consoleTab === 'assets' && editingAssetSn === null && (
                <button type="button" onClick={handleAddAsset} className="btn-save asset-add-topbar-btn">เพิ่มทรัพย์สินเข้าคลัง</button>
              )}
              <button onClick={() => setActiveModal(null)} className="modal-close"><X size={20} /></button>
            </header>

            <div className="console-layout">
              {/* Work Area */}
              <div className="console-content">
                
                {/* TAB 1: MONTHS MANAGER */}
                {consoleTab === 'months' && (
                  <div>
                    <h4 className="console-title">📅 จัดการเดือนและรายงานในระบบ</h4>
                    <form onSubmit={handleAddMonth} className="console-form" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                      <div className="console-field" style={{ flex: '1' }}>
                        <span className="console-label">รหัสคีย์เดือน (เช่น 2026-08)</span>
                        <input type="text" placeholder="YYYY-MM" value={newMonthKey} onChange={e => setNewMonthKey(e.target.value)} className="console-input" />
                      </div>
                      <div className="console-field" style={{ flex: '1' }}>
                        <span className="console-label">ชื่อแสดงในรายงาน (เช่น สิงหาคม 2569)</span>
                        <input type="text" placeholder="ชื่อเดือน พ.ศ." value={newMonthName} onChange={e => setNewMonthName(e.target.value)} className="console-input" />
                      </div>
                      <button type="submit" className="btn-save" style={{ width: 'auto', padding: '8px 20px', height: '38px' }}>เพิ่มเดือนใหม่</button>
                    </form>

                    <div className="console-table-scroll">
                      <table className="details-table">
                        <thead>
                          <tr>
                            <th>คีย์เดือน</th>
                            <th>ชื่อเดือน</th>
                            <th>สถานะอุปกรณ์รวม</th>
                            <th>งาน Support</th>
                            <th>การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(data).map(key => (
                            <tr key={key}>
                              <td><strong>{key}</strong></td>
                              <td>{data[key].monthName}</td>
                              <td>{data[key].totalAssets} เครื่อง</td>
                              <td>{data[key].ticketsCount} เคส</td>
                              <td>
                                <button onClick={() => handleDeleteMonth(key)} className="console-delete-btn">ลบ</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 2: EDIT KPIS */}
                {consoleTab === 'kpis' && (
                  <div>
                    <div className="console-section-topbar">
                      <h4 style={{ margin: 0, fontSize: '1.15rem' }}>📈 ปรับเปลี่ยนค่าตัวชี้วัด KPIs ประจำเดือน</h4>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>เลือกเดือนที่จะแก้ไข:</span>
                        <select value={consoleMonth} onChange={e => setConsoleMonth(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: '#1f2937', color: 'white' }}>
                          {Object.keys(data).map(key => (
                            <option key={key} value={key}>{data[key].monthName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="console-kpi-grid">
                      <div className="console-card">
                        <h5 style={{ margin: '0 0 12px 0', color: 'var(--primary)' }}>💻 ทรัพย์สิน IT</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div className="console-field">
                            <span className="console-label">จำนวนอุปกรณ์ทั้งหมด (เครื่อง)</span>
                            <input type="number" value={consoleMonthData.totalAssets || 0} onChange={e => handleKpiChange('totalAssets', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">มูลค่าคลังรวม (บาท)</span>
                            <input type="number" value={consoleMonthData.assetValue || 0} onChange={e => handleKpiChange('assetValue', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">ใกล้หมดอายุ (เครื่อง)</span>
                            <input type="number" value={consoleMonthData.assetsExpiring || 0} onChange={e => handleKpiChange('assetsExpiring', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">ชำรุด (เครื่อง)</span>
                            <input type="number" value={consoleMonthData.assetsBroken || 0} onChange={e => handleKpiChange('assetsBroken', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">สูญหาย (เครื่อง)</span>
                            <input type="number" value={consoleMonthData.assetsLost || 0} onChange={e => handleKpiChange('assetsLost', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">เครื่องว่าง (เครื่อง)</span>
                            <input type="number" value={consoleMonthData.assetsVacant || 0} onChange={e => handleKpiChange('assetsVacant', Number(e.target.value))} className="console-input" />
                          </div>
                        </div>
                      </div>

                      <div className="console-card">
                        <h5 style={{ margin: '0 0 12px 0', color: 'var(--violet)' }}>🚨 บริการ Support & SLA</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div className="console-field">
                            <span className="console-label">เคสแจ้งเสียทั้งหมด (เคส)</span>
                            <input type="number" value={consoleMonthData.ticketsCount || 0} onChange={e => handleKpiChange('ticketsCount', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">อัตราทำได้ตาม SLA (%)</span>
                            <input type="number" step="0.1" value={consoleMonthData.slaPercent || 0} onChange={e => handleKpiChange('slaPercent', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">เฉลี่ยเวลารับเรื่อง (นาที)</span>
                            <input type="number" value={consoleMonthData.responseTime || 0} onChange={e => handleKpiChange('responseTime', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">เฉลี่ยเวลาแก้ไขปัญหา (นาที)</span>
                            <input type="number" value={consoleMonthData.resolutionTime || 0} onChange={e => handleKpiChange('resolutionTime', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">ความพึงพอใจลูกค้า CSAT (เต็ม 5)</span>
                            <input type="number" step="0.01" value={consoleMonthData.csat || 0} onChange={e => handleKpiChange('csat', Number(e.target.value))} className="console-input" />
                          </div>
                        </div>
                      </div>

                      <div className="console-card">
                        <h5 style={{ margin: '0 0 12px 0', color: 'var(--secondary)' }}>💿 ลิขสิทธิ์ซอฟต์แวร์</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div className="console-field">
                            <span className="console-label">ประเภทซอฟต์แวร์ลิขสิทธิ์</span>
                            <input type="number" value={consoleMonthData.totalSoftware || 0} onChange={e => handleKpiChange('totalSoftware', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">เปิดใช้งานอยู่ (สิทธิ์)</span>
                            <input type="number" value={consoleMonthData.licensesInUse || 0} onChange={e => handleKpiChange('licensesInUse', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">สิทธิ์ว่างคงเหลือ (สิทธิ์)</span>
                            <input type="number" value={consoleMonthData.licensesVacant || 0} onChange={e => handleKpiChange('licensesVacant', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">ค่าซอฟต์แวร์รายเดือน (บาท)</span>
                            <input type="number" value={consoleMonthData.softwareCost || 0} onChange={e => handleKpiChange('softwareCost', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">ค่าซอฟต์แวร์รายปี (บาท)</span>
                            <input type="number" value={consoleMonthData.softwareAnnualCost || 0} onChange={e => handleKpiChange('softwareAnnualCost', Number(e.target.value))} className="console-input" />
                          </div>
                        </div>
                      </div>

                      <div className="console-card">
                        <h5 style={{ margin: '0 0 12px 0', color: 'var(--success)' }}>🛡️ ความปลอดภัย IT & Repairs</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div className="console-field">
                            <span className="console-label">สำรองข้อมูลสำเร็จ (%)</span>
                            <input type="number" value={consoleMonthData.backupSuccess || 0} onChange={e => handleKpiChange('backupSuccess', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">เหตุความปลอดภัย (ครั้ง)</span>
                            <input type="number" value={consoleMonthData.securityIncidents || 0} onChange={e => handleKpiChange('securityIncidents', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">งบประมาณส่งซ่อม (บาท)</span>
                            <input type="number" value={consoleMonthData.repairCost || 0} onChange={e => handleKpiChange('repairCost', Number(e.target.value))} className="console-input" />
                          </div>
                          <div className="console-field">
                            <span className="console-label">จำนวนชิ้นที่ส่งซ่อม (เครื่อง)</span>
                            <input type="number" value={consoleMonthData.repairCount || 0} onChange={e => handleKpiChange('repairCount', Number(e.target.value))} className="console-input" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: PROJECTS & RECOMMENDATIONS */}
                {consoleTab === 'projects' && (
                  <div>
                    <div className="console-section-topbar">
                      <h4 style={{ margin: 0, fontSize: '1.15rem' }}>🗒️ จัดการโครงการ & ข้อเสนอแนะสำหรับพัฒนา</h4>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>เลือกเดือน:</span>
                        <select value={consoleMonth} onChange={e => setConsoleMonth(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: '#1f2937', color: 'white' }}>
                          {Object.keys(data).map(key => (
                            <option key={key} value={key}>{data[key].monthName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="console-projects-grid">
                      <div>
                        <h5 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>โครงการที่ดำเนินการอยู่ (Ongoing Projects)</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {(consoleMonthData.ongoingProjects || []).length > 0 ? (
                            (consoleMonthData.ongoingProjects || []).map((proj, idx) => (
                              <div key={idx} style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{proj.title}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{proj.desc}</div>
                                </div>
                                <button onClick={() => handleDeleteProject(idx)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>ไม่มีรายการโครงการเดือนนี้</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                          <input type="text" placeholder="ชื่อโครงการ" value={newProjTitle} onChange={e => setNewProjTitle(e.target.value)} className="console-input" />
                          <input type="text" placeholder="ความคืบหน้า" value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} className="console-input" />
                          <button type="button" onClick={handleAddProject} className="btn-save" style={{ width: '100%', padding: '6px' }}>เพิ่มโครงการ</button>
                        </div>
                      </div>

                      <div>
                        <h5 style={{ margin: '0 0 10px 0', color: 'var(--warning)' }}>ข้อเสนอแนะเชิงวิเคราะห์ (Recommendations)</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {(consoleMonthData.recommendations || []).length > 0 ? (
                            (consoleMonthData.recommendations || []).map((rec, idx) => (
                              <div key={idx} style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.85rem' }}>{rec}</div>
                                <button onClick={() => handleDeleteRecommendation(idx)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>ไม่มีข้อเสนอแนะสำหรับเดือนนี้</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                          <textarea rows="2" placeholder="กรอกข้อเสนอแนะ..." value={newRecText} onChange={e => setNewRecText(e.target.value)} className="console-input" style={{ resize: 'vertical' }} />
                          <button type="button" onClick={handleAddRecommendation} className="btn-save" style={{ width: '100%', padding: '6px' }}>เพิ่มข้อเสนอแนะ</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: ASSETS INVENTORY EDITOR */}
                {consoleTab === 'assets' && (
                  <div className="lark-registry">
                    <div className="console-form asset-registry-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                      <div className="console-field">
                        <span className="console-label">ผู้เบิกใช้งาน</span>
                        <input type="text" value={newAssetUser} onChange={e => setNewAssetUser(e.target.value)} placeholder="เช่น อมร แก้วสด" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">ตำแหน่ง/แผนก</span>
                        <input type="text" value={newAssetPosition} onChange={e => setNewAssetPosition(e.target.value)} placeholder="เช่น Marketing" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">รายการอุปกรณ์หลัก (Tag)*</span>
                        <AssetTagEditor value={newAssetItemType} onChange={setNewAssetItemType} single placeholder="เช่น Notebook Lenovo" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">อุปกรณ์เพิ่มเติม (Tags)</span>
                        <AssetTagEditor value={newAssetAdditionalEquipment} onChange={setNewAssetAdditionalEquipment} placeholder="เช่น สาย HDMI" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">หมายเลขซีเรียล</span>
                        <input type="text" value={newAssetSerial} onChange={e => setNewAssetSerial(e.target.value)} placeholder="เช่น MC-010" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">สถานะ</span>
                        <select value={newAssetStatus} onChange={e => setNewAssetStatus(e.target.value)} className="console-input">
                          <option value="ใช้งาน">ใช้งาน</option>
                          <option value="ว่าง">ว่าง</option>
                          <option value="ชำรุด">ชำรุด</option>
                          <option value="รอซ่อม">รอซ่อม</option>
                          <option value="สูญหาย">สูญหาย</option>
                        </select>
                      </div>
                      <div className="console-field">
                        <span className="console-label">หมายเหตุ</span>
                        <input type="text" value={newAssetNotes} onChange={e => setNewAssetNotes(e.target.value)} placeholder="รายละเอียด" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">วันที่ Submit</span>
                        <input type="text" value={newAssetSubmittedOn} onChange={e => setNewAssetSubmittedOn(e.target.value)} placeholder="YYYY-MM-DD" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">Respondents</span>
                        <input type="text" value={newAssetRespondent} onChange={e => setNewAssetRespondent(e.target.value)} placeholder="ผู้ตอบกลับ" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">วันที่เบิกใช้งาน</span>
                        <input type="text" value={newAssetDate} onChange={e => setNewAssetDate(e.target.value)} placeholder="วันที่เบิกใช้งาน" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">ซอฟต์แวร์ / App</span>
                        <AssetTagEditor value={newAssetSoftwareApp} onChange={setNewAssetSoftwareApp} placeholder="โปรแกรม" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">เมลที่ลงทะเบียน</span>
                        <input type="text" value={newAssetRegisteredEmail} onChange={e => setNewAssetRegisteredEmail(e.target.value)} placeholder="อีเมล" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">หมายเลขอุปกรณ์เพิ่มเติม</span>
                        <input type="text" value={newAssetAdditionalSerial} onChange={e => setNewAssetAdditionalSerial(e.target.value)} placeholder="เช่น Pencil-001, Cable-018" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">กำหนดคืน</span>
                        <input type="text" value={newAssetReturnDueDate} onChange={e => setNewAssetReturnDueDate(e.target.value)} placeholder="วันที่กำหนดคืน" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">วันที่ตรวจสอบ</span>
                        <input type="text" value={newAssetAuditDate} onChange={e => setNewAssetAuditDate(e.target.value)} placeholder="วันที่ตรวจสอบ" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">วันที่ซื้อ</span>
                        <input type="text" value={newAssetPurchaseDate} onChange={e => setNewAssetPurchaseDate(e.target.value)} placeholder="วันที่ซื้อ" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">ปีที่ผลิตของรุ่น</span>
                        <input type="number" min="1900" max="2600" value={newAssetProductionYear} onChange={e => setNewAssetProductionYear(e.target.value)} placeholder="เช่น 2024 หรือ 2567" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">วันหมดประกัน</span>
                        <input type="text" value={newAssetWarrantyExpiry} onChange={e => setNewAssetWarrantyExpiry(e.target.value)} placeholder="วันหมดประกัน" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">ค่าใช้จ่าย</span>
                        <input type="text" value={newAssetCost} onChange={e => setNewAssetCost(e.target.value)} placeholder="ค่าใช้จ่าย" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">ยี่ห้อ/รุ่นสำหรับค้นหาราคา*</span>
                        <input type="text" value={newAssetMarketModel} onChange={e => setNewAssetMarketModel(e.target.value)} placeholder="เช่น Lenovo ThinkPad E14 Gen 5 21JK" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">ราคาตลาดอ้างอิง (บาท)</span>
                        <input type="number" min="0" value={newAssetMarketPrice} onChange={e => setNewAssetMarketPrice(e.target.value)} placeholder="0" className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">สถานะราคา</span>
                        <select value={newAssetPriceAvailability} onChange={e => setNewAssetPriceAvailability(e.target.value)} className="console-input">
                          <option value="current">ราคาปัจจุบัน (ยังมีขาย)</option>
                          <option value="latest">ราคาขายล่าสุด (เลิกขายแล้ว)</option>
                        </select>
                      </div>
                      <div className="console-field">
                        <span className="console-label">ลิงก์แหล่งราคา</span>
                        <input type="url" value={newAssetPriceSourceUrl} onChange={e => setNewAssetPriceSourceUrl(e.target.value)} placeholder="https://..." className="console-input" />
                      </div>
                      <div className="console-field">
                        <span className="console-label">วันที่ตรวจสอบราคา</span>
                        <input type="date" value={newAssetPriceCheckedAt} onChange={e => setNewAssetPriceCheckedAt(e.target.value)} className="console-input" />
                      </div>
                      
                      {/* Export Actions */}
                      <div className="console-field" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', minWidth: '220px' }}>
                        <button type="button" onClick={() => exportAssetsToExcel(consoleAssets, consoleMonth)} className="sidebar-btn" style={{ flex: 1, backgroundColor: '#059669', color: 'white', padding: '6px', height: '42px', margin: 0, border: 'none' }}>
                          <Download size={16} style={{ marginRight: '6px' }} /> Excel
                        </button>
                        <button type="button" onClick={exportAssetTemplate} className="sidebar-btn" style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', padding: '6px', height: '42px', margin: 0, border: 'none' }}>
                          <Download size={16} style={{ marginRight: '6px' }} /> Template
                        </button>
                      </div>
                      <div className={`asset-inline-save-status ${consoleSaveMessage ? (consoleSaveMessage.startsWith('บันทึกสำเร็จ') ? 'success' : 'error') : ''}`} style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                        {consoleSaveMessage || `พร้อมบันทึกข้อมูล ${data[consoleMonth]?.monthName || consoleMonth} ขึ้นแดชบอร์ด`}
                      </div>
                      <button type="button" className="console-save-dashboard-btn asset-inline-save-btn" onClick={saveConsoleChanges} disabled={consoleSaving} style={{ gridColumn: '1 / -1' }}>
                        {consoleSaving ? 'กำลังบันทึกและซิงค์...' : '💾 บันทึกและอัปเดตแดชบอร์ด'}
                      </button>
                      {editingAssetSn !== null ? (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button type="button" onClick={handleAddAsset} className="btn-save" style={{ flex: '1', height: '36px' }}>บันทึกการแก้ไข</button>
                          <button type="button" onClick={handleCancelEditAsset} className="sidebar-btn" style={{ minWidth: '100px', height: '36px', margin: 0, padding: '0 10px', backgroundColor: '#4b5563', color: 'white' }}>ยกเลิก</button>
                        </div>
                      ) : null}
                    </div>

                    <div className="lark-registry-toolbar">
                      <input
                        type="search"
                        value={consoleAssetSearch}
                        onChange={(event) => setConsoleAssetSearch(event.target.value)}
                        placeholder="ค้นหาเลขรายการ ชื่อ แผนก อุปกรณ์ หมายเลขเครื่อง หรือสถานะ..."
                        aria-label="ค้นหาทะเบียนทรัพย์สิน"
                      />
                      <span>แสดง {consoleAssets.length} จาก {assetsList.length} รายการ · จัดกลุ่มตามแผนก</span>
                    </div>

                    <div className="console-table-scroll lark-registry-scroll">
                      <table className="details-table lark-registry-table">
                        <thead>
                          <tr>
                            <th>Number</th>
                            <th>Submitted on</th>
                            <th>Respondents</th>
                            <th>วันที่เบิกใช้งาน</th>
                            <th>บุคคลเบิกใช้อุปกรณ์</th>
                            <th>ตำแหน่ง</th>
                            <th>รายการอุปกรณ์หลัก</th>
                            <th>อุปกรณ์เพิ่มเติมที่ต้องการเบิก</th>
                            <th>ซอฟต์แวร์ / App</th>
                            <th>เมลที่ลงทะเบียน</th>
                            <th>หมายเลขอุปกรณ์</th>
                            <th>หมายเลขอุปกรณ์เพิ่มเติม</th>
                            <th>กำหนดคืนอุปกรณ์</th>
                            <th>สถานะ</th>
                            <th>หมายเหตุ</th>
                            <th>วันที่ตรวจสอบ</th>
                            <th>วันที่ซื้อ</th>
                            <th>ปีที่ผลิต</th>
                            <th>วันหมดประกัน</th>
                            <th>ค่าใช้จ่าย</th>
                            <th>รุ่นอ้างอิงราคา</th>
                            <th>ราคาตลาด</th>
                            <th>แหล่งราคา/ตรวจสอบ</th>
                            <th>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consoleAssets.map((asset, idx) => {
                            const previous = consoleAssets[idx - 1];
                            const showGroup = !previous || String(previous.position || '-') !== String(asset.position || '-');
                            return (
                            <Fragment key={asset.sn ?? idx}>
                              {showGroup && (
                                <tr className="lark-group-row">
                                  <td colSpan="24">
                                    <span>{asset.position || 'ไม่ระบุแผนก'}</span>
                                    <small>{consoleAssets.filter((row) => String(row.position || '-') === String(asset.position || '-')).length} รายการ</small>
                                  </td>
                                </tr>
                              )}
                            <tr>
                              <td>{idx + 1}</td>
                              <td>{asset.submittedOn || '-'}</td>
                              <td>{asset.respondent || '-'}</td>
                              <td>{asset.date || '-'}</td>
                              <td>{asset.user}</td>
                              <td>{asset.position}</td>
                              <td>
                                <div className="asset-tag-cell">
                                  <span className="lark-pill lark-pill-device">{asset.itemType || '-'}</span>
                                  <button type="button" onClick={() => {
                                    handleLoadEditAsset(asset);
                                    setEditingAssetTagField({ sn: asset.sn, field: 'itemType' });
                                  }}>แก้ไข Tag</button>
                                  {editingAssetTagField?.sn === asset.sn && editingAssetTagField?.field === 'itemType' && (
                                    <AssetTagPicker
                                      value={newAssetItemType}
                                      onChange={setNewAssetItemType}
                                      options={primaryTagOptions}
                                      single
                                      onClose={() => setEditingAssetTagField(null)}
                                    />
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="asset-tag-cell">
                                  <AssetTags value={asset.additionalEquipment} />
                                  <button type="button" onClick={() => {
                                    handleLoadEditAsset(asset);
                                    setEditingAssetTagField({ sn: asset.sn, field: 'additionalEquipment' });
                                  }}>แก้ไข Tag</button>
                                  {editingAssetTagField?.sn === asset.sn && editingAssetTagField?.field === 'additionalEquipment' && (
                                    <AssetTagPicker
                                      value={newAssetAdditionalEquipment}
                                      onChange={setNewAssetAdditionalEquipment}
                                      options={additionalTagOptions}
                                      onClose={() => setEditingAssetTagField(null)}
                                    />
                                  )}
                                </div>
                              </td>
                              <td><AssetTags value={asset.softwareApp} /></td>
                              <td>{asset.registeredEmail || '-'}</td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <strong>{asset.deviceSerial}</strong>
                                  {(() => {
                                    const match = externalDevices.find(d => 
                                      (d.deviceNumber || '').toLowerCase().replace(/\s/g, '') === (asset.deviceSerial || '').toLowerCase().replace(/\s/g, '')
                                      || (d.deviceNumber || '').toLowerCase().replace(/\s/g, '') === (asset.additionalSerial || '').toLowerCase().replace(/\s/g, '')
                                    );
                                    if (!match) return null;
                                    
                                    let badgeColor = 'var(--text-muted)';
                                    let statusText = 'Unverified';
                                    if (match.status === 'active') {
                                      if (match.daysRemaining > 7) { badgeColor = 'var(--success)'; statusText = 'Verified'; }
                                      else { badgeColor = 'var(--warning)'; statusText = 'Expiring Soon'; }
                                    }
                                    return (
                                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: badgeColor, color: '#fff', alignSelf: 'flex-start' }} title={`ตรวจสอบล่าสุด: ${match.lastVerifiedAt ? new Date(match.lastVerifiedAt).toLocaleString('th-TH') : '-'}`}>
                                        {statusText} ({match.daysRemaining} วัน)
                                      </span>
                                    );
                                  })()}
                                </div>
                              </td>
                              <td>{asset.additionalSerial || '-'}</td>
                              <td>{asset.returnDueDate || '-'}</td>
                              <td>
                                <span className={`lark-status lark-status-${asset.status === 'ใช้งาน' ? 'active' : ['รอซ่อม', 'ชำรุด'].includes(asset.status) ? 'repair' : asset.status === 'ว่าง' ? 'vacant' : 'other'}`}>
                                  {asset.status || '-'}
                                </span>
                              </td>
                              <td>{asset.notes || '-'}</td>
                              <td>{asset.inspectionDate || '-'}</td>
                              <td>{asset.purchaseDate || '-'}</td>
                              <td>{asset.productionYear || '-'}</td>
                              <td>{asset.warrantyEndDate || '-'}</td>
                              <td className="lark-number">{Number(asset.expense || 0).toLocaleString('th-TH')}</td>
                              <td>{asset.marketModel || <span style={{ color: 'var(--warning)' }}>รอระบุรุ่น</span>}</td>
                              <td className="lark-number">{Number(asset.marketPrice || 0) > 0 ? formatThaiBaht(asset.marketPrice) : '-'}</td>
                              <td>
                                {asset.priceSourceUrl ? <a href={asset.priceSourceUrl} target="_blank" rel="noreferrer">{asset.priceAvailability === 'latest' ? 'ราคาขายล่าสุด' : 'ราคาปัจจุบัน'}</a> : '-'}
                                {asset.priceCheckedAt ? <small style={{ display: 'block' }}>{asset.priceCheckedAt}</small> : null}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button onClick={() => handleLoadEditAsset(asset)} className="btn-details" style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>แก้ไข</button>
                                  <button onClick={() => handleDeleteAsset(asset.sn)} className="console-delete-btn">ลบ</button>
                                </div>
                              </td>
                            </tr>
                            </Fragment>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 5: TICKETS SUPPORT EDITOR */}
                {consoleTab === 'tickets' && (() => {
                  const tickets = consoleMonthData.ticketsList || [];
                  return (
                    <div>
                      <div className="console-section-topbar">
                        <h4 style={{ margin: 0, fontSize: '1.15rem' }}>🚨 ประวัติรับเคสแจ้งซ่อม Support - {editingTicketSn !== null ? <span style={{ color: 'var(--warning)' }}>โหมดแก้ไขรหัส #{editingTicketSn}</span> : <span>โหมดเพิ่มข้อมูล</span>}</h4>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>เลือกเดือนที่จะจัดการ:</span>
                          <select value={consoleMonth} onChange={e => setConsoleMonth(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: '#1f2937', color: 'white' }}>
                            {Object.keys(data).map(key => (
                              <option key={key} value={key}>{data[key].monthName}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="console-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                        <div className="console-field">
                          <span className="console-label">ชื่อผู้แจ้ง</span>
                          <input type="text" value={newTicketComplainant} onChange={e => setNewTicketComplainant(e.target.value)} placeholder="อมร แก้วสด" className="console-input" />
                        </div>
                        <div className="console-field">
                          <span className="console-label">อีเมล</span>
                          <input type="text" value={newTicketEmail} onChange={e => setNewTicketEmail(e.target.value)} placeholder="user@domain.com" className="console-input" />
                        </div>
                        <div className="console-field">
                          <span className="console-label">AnyDesk ID</span>
                          <input type="text" value={newTicketAnydesk} onChange={e => setNewTicketAnydesk(e.target.value)} placeholder="เช่น 1 234 567" className="console-input" />
                        </div>
                        <div className="console-field">
                          <span className="console-label">อาการที่แจ้ง*</span>
                          <input type="text" value={newTicketIssue} onChange={e => setNewTicketIssue(e.target.value)} placeholder="จอดับ, พิมพ์ไม่ได้" className="console-input" />
                        </div>
                        <div className="console-field">
                          <span className="console-label">สาเหตุการเสีย</span>
                          <input type="text" value={newTicketCause} onChange={e => setNewTicketCause(e.target.value)} placeholder="เสื่อมตามสภาพ" className="console-input" />
                        </div>
                        <div className="console-field">
                          <span className="console-label">ผู้ดำเนินงาน (IT)</span>
                          <input type="text" value={newTicketResponder} onChange={e => setNewTicketResponder(e.target.value)} placeholder="ชื่อเจ้าหน้าที่" className="console-input" />
                        </div>
                        <div className="console-field">
                          <span className="console-label">เวลาแก้ (HH:MM)</span>
                          <input type="text" value={newTicketDuration} onChange={e => setNewTicketDuration(e.target.value)} className="console-input" />
                        </div>
                        <div className="console-field">
                          <span className="console-label">สถานะ</span>
                          <select value={newTicketStatus} onChange={e => setNewTicketStatus(e.target.value)} className="console-input">
                            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                            <option value="จ่ายเงินแล้ว">จ่ายเงินแล้ว (ซื้ออุปกรณ์)</option>
                          </select>
                        </div>
                        <div className="console-field">
                          <span className="console-label">ค่าใช้จ่าย (บาท)</span>
                          <input type="number" value={newTicketCost} onChange={e => setNewTicketCost(e.target.value)} className="console-input" />
                        </div>
                        {editingTicketSn !== null ? (
                          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button type="button" onClick={handleAddTicket} className="btn-save" style={{ flex: '1', height: '36px' }}>บันทึกการแก้ไข</button>
                            <button type="button" onClick={handleCancelEditTicket} className="sidebar-btn" style={{ minWidth: '100px', height: '36px', margin: 0, padding: '0 10px', backgroundColor: '#4b5563', color: 'white' }}>ยกเลิก</button>
                          </div>
                        ) : (
                          <button type="button" onClick={handleAddTicket} className="btn-save" style={{ gridColumn: '1 / -1', marginTop: '8px', height: '36px' }}>บันทึกเคสแจ้งซ่อม</button>
                        )}
                      </div>

                      <div className="console-table-scroll">
                        <table className="details-table">
                          <thead>
                            <tr>
                              <th>SN</th>
                              <th>ผู้แจ้ง</th>
                              <th>เคส/ปัญหา</th>
                              <th>สาเหตุ</th>
                              <th>เวลา</th>
                              <th>ค่าใช้จ่าย</th>
                              <th>สถานะ</th>
                              <th>จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tickets.map((t, idx) => (
                              <tr key={idx}>
                                <td>{t.sn}</td>
                                <td>
                                  <div><strong>{t.complainant}</strong></div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.email}</div>
                                </td>
                                <td>{t.issue}</td>
                                <td>{t.cause}</td>
                                <td>{t.duration}</td>
                                <td>{t.cost > 0 ? formatThaiBaht(t.cost) : '-'}</td>
                                <td>
                                  <span style={{ color: t.status === 'เสร็จสิ้น' || t.status === 'จ่ายเงินแล้ว' ? 'var(--success)' : 'var(--warning)', fontWeight: 'bold' }}>
                                    {t.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => handleLoadEditTicket(t)} className="btn-details" style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>แก้ไข</button>
                                    <button onClick={() => handleDeleteTicket(t.sn)} className="console-delete-btn">ลบ</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 6: BACKUP & SYSTEM RESET */}
                {consoleTab === 'backup' && (
                  <div>
                    <h4 className="console-title">💾 สำรองข้อมูลและรีเซ็ตการตั้งค่าระบบ</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="console-card">
                        <h5 style={{ margin: '0 0 8px 0', color: 'var(--success)' }}>📥 ส่งออกไฟล์ข้อมูลสำรอง (Backup to JSON)</h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                          ดาวน์โหลดข้อมูลแดชบอร์ด ทะเบียนอุปกรณ์ IT และประวัติแจ้งซ่อมทั้งหมดเก็บไว้ในรูปแบบไฟล์ .json
                        </p>
                        <button type="button" onClick={handleExportJson} className="btn-save" style={{ width: 'auto', padding: '10px 20px', backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}>
                          ดาวน์โหลดไฟล์สำรองข้อมูล (.json)
                        </button>
                      </div>

                      <div className="console-card">
                        <h5 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>📤 นำเข้าไฟล์ข้อมูลสำรอง (Import JSON Backup)</h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                          เลือกไฟล์สำรองข้อมูลนามสกุล .json เพื่อกู้คืนสถานะข้อมูลเดิมทั้งหมด
                        </p>
                        <input type="file" accept=".json" onChange={handleImportJson} style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }} />
                      </div>

                      <div className="console-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.03)' }}>
                        <h5 style={{ margin: '0 0 8px 0', color: 'rgb(239, 68, 68)' }}>⚠️ รีเซ็ตระบบใหม่ทั้งหมด (Wipe Database)</h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                          ลบข้อมูลทั้งหมดในฐานข้อมูล ระบบจะถูกล้างค่าให้ว่างเปล่าเหมือนเริ่มต้นใหม่ (คำเตือน: ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้)
                        </p>
                        <button type="button" onClick={handleResetToDefault} className="sidebar-btn" style={{ width: 'auto', padding: '10px 20px', backgroundColor: 'rgb(239, 68, 68)', border: 'none', color: 'white' }}>
                          ลบข้อมูลทั้งหมด (Wipe Database)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
            {consoleTab !== 'assets' && (
              <div className="console-save-bar">
                <span className={consoleSaveMessage ? (consoleSaveMessage.startsWith('บันทึกสำเร็จ') ? 'success' : 'error') : ''}>
                  {consoleSaveMessage || `พร้อมบันทึกข้อมูล ${data[consoleMonth]?.monthName || consoleMonth} ขึ้นแดชบอร์ด`}
                </span>
                <button type="button" className="console-save-dashboard-btn" onClick={saveConsoleChanges} disabled={consoleSaving}>
                  {consoleSaving ? 'กำลังบันทึกและซิงค์...' : '💾 บันทึกและอัปเดตแดชบอร์ด'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    })()}

    {/* MODAL 8: LARK SUITE PUBLIC REGISTRATION FORM */}
    {activeModal === 'larkForm' && (() => {
      const tickets = data[currentMonth]?.ticketsList || [];
      return (
        <div className="modal-overlay active" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="lark-form-container">
            <header className="lark-form-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {larkTicketRole === 'it' ? (
                  <div>
                    <h3>🔧 เมนูปิดงานสำหรับช่างไอที (IT Close Work)</h3>
                    <p>เลือกใบงานที่ค้างคาเพื่ออัปเดตรายละเอียดการแก้ไขและปิดงาน ประจำเดือน {data[currentMonth]?.monthName}</p>
                  </div>
                ) : larkFormType === 'asset' ? (
                  <div>
                    <h3>💻 ลงทะเบียนเครื่องเข้าคลัง (IT Asset Registration)</h3>
                    <p>บันทึกประวัติการเบิกใช้อุปกรณ์ไอทีเครื่องใหม่เข้าสู่คลังทะเบียนกลาง</p>
                  </div>
                ) : (
                  <div>
                    <h3>🚨 แจ้งซ่อมบำรุง / ปัญหาไอที (Report Repair / IT Issue)</h3>
                    <p>แจ้งปัญหาขัดข้องของอุปกรณ์หรือระบบไอทีเพื่อประสานช่างเข้าแก้ไข ประจำเดือน {data[currentMonth]?.monthName}</p>
                  </div>
                )}
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', padding: 0 }}><X size={24} /></button>
              </div>
            </header>

            {larkSubmitted ? (
              <div className="lark-success-screen">
                <div className="lark-success-icon">
                  <CheckCircle size={36} />
                </div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#065f46', fontWeight: '700' }}>ส่งข้อมูลสำเร็จเรียบร้อยแล้ว!</h4>
                <p style={{ margin: '0 0 24px 0', fontSize: '0.875rem', color: '#4b5563' }}>
                  ข้อมูลของคุณได้รับการบันทึกและระบบได้อัปเดตตัวเลขวิเคราะห์แดชบอร์ดให้โดยอัตโนมัติแล้ว
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => setLarkSubmitted(false)} className="lark-submit-btn" style={{ width: 'auto', padding: '10px 24px' }}>กรอกฟอร์มใหม่</button>
                  <button onClick={() => setActiveModal(null)} className="sidebar-btn" style={{ width: 'auto', padding: '10px 24px', margin: 0, backgroundColor: '#e5e7eb', color: '#374151', border: 'none' }}>ปิดหน้าต่าง</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLarkSubmit}>

                {larkFormType === 'ticket' ? (
                  <div className="lark-card">

                    {larkTicketRole === 'user' ? (
                      <div>
                        <div style={{ paddingBottom: '12px', marginBottom: '16px' }}>
                          <h4 style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem', fontWeight: '700' }}>ส่งแจ้งเรื่องซ่อมแซม / ปัญหาที่พบบนแดชบอร์ด ({data[currentMonth]?.monthName})</h4>
                        </div>
                        
                        <div className="lark-field-group">
                          <label>ชื่อผู้แจ้ง / ผู้พบปัญหา <span>*</span></label>
                          <input type="text" className="lark-input" placeholder="ตัวอย่าง: สมเกียรติ ยิ่งดี" value={larkTicketComplainant} onChange={e => setLarkTicketComplainant(e.target.value)} required={larkTicketRole === 'user'} />
                        </div>

                        <div className="lark-field-group lark-form-row-grid">
                          <div>
                            <label>อีเมลผู้แจ้ง</label>
                            <input type="email" className="lark-input" placeholder="user@domain.com" value={larkTicketEmail} onChange={e => setLarkTicketEmail(e.target.value)} />
                          </div>
                          <div>
                            <label>AnyDesk ID</label>
                            <input type="text" className="lark-input" placeholder="เช่น 1 234 567" value={larkTicketAnydesk} onChange={e => setLarkTicketAnydesk(e.target.value)} />
                          </div>
                        </div>

                        <div className="lark-field-group">
                          <label>หมายเลขเครื่องจากทะเบียน (ถ้ามี)</label>
                          <input
                            type="text"
                            className="lark-input"
                            placeholder="เช่น ASUS-019, MC-002"
                            value={larkTicketAssetSerial}
                            onChange={e => setLarkTicketAssetSerial(e.target.value)}
                          />
                          <small style={{ color: '#64748b' }}>เมื่อระบุหมายเลขเครื่อง ระบบจะเปลี่ยนสถานะเป็น “รอซ่อม” และปิดรายการเบิกของเครื่องนั้นอัตโนมัติ</small>
                        </div>

                        <div className="lark-field-group">
                          <label>อาการที่แจ้งซ่อม / ปัญหาที่พบ <span>*</span></label>
                          <input type="text" className="lark-input" placeholder="ตัวอย่าง: หน้าจอไม่ติด, ปริ้นท์งานไม่ออก" value={larkTicketIssue} onChange={e => setLarkTicketIssue(e.target.value)} required={larkTicketRole === 'user'} />
                        </div>
                      </div>
                    ) : (() => {
                      const pendingTickets = tickets.filter(t => t.status === 'กำลังดำเนินการ');
                      const selectedTicket = pendingTickets.find(t => Number(t.sn) === Number(selectedPendingTicketSn));

                      return (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>
                            <h4 style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem', fontWeight: '700' }}>
                              {selectedTicket ? `🔧 ปิดใบงานซ่อมแซม [SN: ${selectedTicket.sn}]` : '📋 รายการงานซ่อมที่ยังไม่ได้ปิด (กำลังดำเนินการ)'}
                            </h4>
                            {selectedTicket && (
                              <button type="button" onClick={() => setSelectedPendingTicketSn('')} style={{ padding: '4px 10px', fontSize: '0.75rem', backgroundColor: '#e5e7eb', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                ย้อนกลับไปรายการงาน
                              </button>
                            )}
                          </div>

                          {!selectedTicket ? (
                            /* View 1: List of pending tickets */
                            pendingTickets.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                                {pendingTickets.map(t => (
                                  <div key={t.sn} style={{ padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: '1', paddingRight: '12px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>รหัส #{t.sn}</span>
                                        <strong style={{ fontSize: '0.85rem', color: '#1f2937' }}>{t.complainant}</strong>
                                        <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>({t.date})</span>
                                      </div>
                                      <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>
                                        <strong>อาการเสีย:</strong> {t.issue}
                                      </div>
                                    </div>
                                    <button type="button" onClick={() => {
                                      setSelectedPendingTicketSn(String(t.sn));
                                      setLarkTicketResponder('');
                                      setLarkTicketDuration('00:30');
                                      setLarkTicketCause('');
                                      setLarkTicketCost('0');
                                      setLarkTicketStatus('เสร็จสิ้น');
                                    }} style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                      เลือกและปิดงาน
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ padding: '24px 12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center' }}>
                                🎉 ไม่มีงานซ่อมที่ค้างคาอยู่ในขณะนี้ ทุกใบงานได้รับการแก้ไขเรียบร้อยแล้ว
                              </div>
                            )
                          ) : (
                            /* View 2: Form to close the selected ticket */
                            <div>
                              <div style={{ padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', marginBottom: '16px', fontSize: '0.8rem' }}>
                                <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '4px' }}>ข้อมูลผู้แจ้ง:</div>
                                <div>👤 <strong>ผู้แจ้ง:</strong> {selectedTicket.complainant} (เมล: {selectedTicket.email} / AnyDesk: {selectedTicket.anydesk})</div>
                                <div>⚠️ <strong>ปัญหาที่พบ:</strong> {selectedTicket.issue}</div>
                              </div>

                              <div className="lark-field-group lark-form-row-grid">
                                <div>
                                  <label>ผู้ดำเนินงาน (ช่าง IT) <span>*</span></label>
                                  <input type="text" className="lark-input" placeholder="เช่น ช่างก้องภพ (IT)" value={larkTicketResponder} onChange={e => setLarkTicketResponder(e.target.value)} required={larkTicketRole === 'it'} />
                                </div>
                                <div>
                                  <label>เวลาแก้เสร็จ (ชั่วโมง:นาที)</label>
                                  <input type="text" className="lark-input" placeholder="เช่น 00:45" value={larkTicketDuration} onChange={e => setLarkTicketDuration(e.target.value)} />
                                </div>
                              </div>

                              <div className="lark-field-group">
                                <label>สาเหตุการเสีย / วิธีแก้ไข</label>
                                <input type="text" className="lark-input" placeholder="ตัวอย่าง: เปลี่ยนสาย LAN ใหม่, รีสตาร์ทการตั้งค่าเครือข่าย" value={larkTicketCause} onChange={e => setLarkTicketCause(e.target.value)} />
                              </div>

                              <div className="lark-field-group lark-form-row-grid">
                                <div>
                                  <label>อัพเดตสถานะใบงาน</label>
                                  <select className="lark-input" value={larkTicketStatus} onChange={e => setLarkTicketStatus(e.target.value)}>
                                    <option value="เสร็จสิ้น">เสร็จสิ้น (Resolved)</option>
                                    <option value="จ่ายเงินแล้ว">จ่ายเงินแล้ว (ซื้ออะไหล่เสริม)</option>
                                  </select>
                                </div>
                                <div>
                                  <label>ค่าใช้จ่ายซ่อมแซม (บาท)</label>
                                  <input type="number" className="lark-input" value={larkTicketCost} onChange={e => setLarkTicketCost(e.target.value)} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="lark-card">
                    <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, color: '#1e40af', fontSize: '1rem', fontWeight: '700' }}>ลงทะเบียนอุปกรณ์เครื่องใหม่เข้าทะเบียนกลาง</h4>
                    </div>

                    <div className="lark-field-group">
                      <label>ชื่อผู้ครอบครองใช้งาน</label>
                      <input type="text" className="lark-input" placeholder="เช่น อมร แก้วสด (หรือใส่ ส่วนกลาง)" value={larkAssetUser} onChange={e => setLarkAssetUser(e.target.value)} />
                    </div>

                    <div className="lark-field-group">
                      <label>ตำแหน่ง / แผนก</label>
                      <input type="text" className="lark-input" placeholder="เช่น Accounting, Marketing, HR" value={larkAssetPosition} onChange={e => setLarkAssetPosition(e.target.value)} />
                    </div>

                    <div className="lark-field-group">
                      <label>ประเภทอุปกรณ์ไอที / รุ่นหลัก <span>*</span></label>
                      <input type="text" className="lark-input" placeholder="ตัวอย่าง: Notebook Lenovo, Computer (Pc)" value={larkAssetItemType} onChange={e => setLarkAssetItemType(e.target.value)} required={larkFormType === 'asset'} />
                    </div>

                    <div className="lark-field-group">
                      <label>ซีเรียลนัมเบอร์ / รหัสเครื่อง (Serial Number)</label>
                      <input type="text" className="lark-input" placeholder="เช่น MC-054, LNV-987" value={larkAssetSerial} onChange={e => setLarkAssetSerial(e.target.value)} />
                    </div>

                    <div className="lark-field-group">
                      <label>สถานะคลังเริ่มต้น</label>
                      <select className="lark-input" value={larkAssetStatus} onChange={e => setLarkAssetStatus(e.target.value)}>
                        <option value="ใช้งาน">ใช้งาน (Active)</option>
                        <option value="ว่าง">ว่าง (Vacant)</option>
                        <option value="ชำรุด">ชำรุด (Broken)</option>
                        <option value="รอซ่อม">รอซ่อม (Repairing)</option>
                        <option value="สูญหาย">สูญหาย (Lost)</option>
                      </select>
                    </div>

                    <div className="lark-field-group">
                      <label>หมายเหตุ / รายละเอียดเพิ่มเติม</label>
                      <input type="text" className="lark-input" placeholder="ตัวอย่าง: รับเข้าจากโครงการเปลี่ยนเครื่องปี 2026" value={larkAssetNotes} onChange={e => setLarkAssetNotes(e.target.value)} />
                    </div>
                  </div>
                )}

                {(!larkSubmitted && (larkFormType !== 'ticket' || larkTicketRole !== 'it' || selectedPendingTicketSn !== '')) && (
                  <button type="submit" className="lark-submit-btn">ส่งบันทึกข้อมูล (Submit Record)</button>
                )}
              </form>
            )}
          </div>
        </div>
      );
    })()}
  </>
  );
}

export default function App() {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [checkingAuth, setCheckingAuth] = useState(() => Boolean(getStoredAuth()));

  useEffect(() => {
    const expired = () => setAuth(null);
    window.addEventListener('it-auth-expired', expired);
    return () => window.removeEventListener('it-auth-expired', expired);
  }, []);

  useEffect(() => {
    if (!auth?.token) {
      setCheckingAuth(false);
      return;
    }
    let cancelled = false;
    authFetch(`${API_BASE}/api/auth/me`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('session-invalid');
        const result = await response.json();
        if (!cancelled) setAuth((current) => ({ ...current, user: result.user }));
      })
      .catch(() => {
        if (!cancelled) {
          clearAuth();
          setAuth(null);
        }
      })
      .finally(() => { if (!cancelled) setCheckingAuth(false); });
    return () => { cancelled = true; };
  }, [auth?.token]);

  const logout = () => {
    clearAuth();
    setAuth(null);
  };

  if (checkingAuth) return <div className="auth-loading">กำลังตรวจสอบสิทธิ์...</div>;
  if (!auth?.user) return <Login onLogin={setAuth} />;

  const dashboard = <Dashboard currentUser={auth.user} onLogout={logout} />;
  const canRequestService = auth.user.role === 'admin';
  return (
    <Routes>
      <Route path="/" element={dashboard} />
      <Route path="/form" element={canRequestService ? <LarkForm /> : dashboard} />
      <Route path="*" element={dashboard} />
    </Routes>
  );
}

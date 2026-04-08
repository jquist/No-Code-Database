import logo from '../../assets/schemalab-logo-background.svg';
import { Dropdown, Button, Space } from 'antd';
import type { MenuProps} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

// const items: MenuProps['items'] = [
//   {
//     label: (
//       <a href="https://www.antgroup.com" target="_blank" rel="noopener noreferrer">
//         1st menu item
//       </a>
//     ),
//     key: '0',
//   },
//   {
//     label: (
//       <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
//         2nd menu item
//       </a>
//     ),
//     key: '1',
//   },
//   {
//     type: 'divider',
//   },
//   {
//     label: '3rd menu item',
//     key: '3',
//   },
// ];

export const NavBar = () => {
    const navigate = useNavigate();

    return (
        <div className="navbar">
            <a onClick={() => navigate('/')}><img src={logo} className="logo"/></a>
            {/* <Dropdown menu={{ items }} trigger={[ 'click' ]}>
                <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        Test <DownOutlined />
                    </Space>
                </a>         
            </Dropdown> */}
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Space } from 'antd';
import type { DropdownProps, MenuProps } from 'antd';
import { DownOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth, PasswordResetType, UpdateName } from '../contexts/auth-context';

interface FormState {
    first_name: string,
    last_name: string,
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string,
}

interface ProfileDropDownProps {
    dataTestid: string
}

export const ProfileDropDown = ({dataTestid}: ProfileDropDownProps) => {
    const { setSettings, user, logout } = useAuth();

    const onMenuClick: MenuProps["onClick"] = ({ key }) => {
        switch (key) {
            case "1":
                break;
            case "2":
                setSettings(true);
                break;
            case "3":
                logout();
                break;
        }
    }

    const name = user?.name;

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: <span data-testid={`${dataTestid}-dropdown-name`}>{name}</span>,
        },
        {
            key: '2',
            label: <span data-testid={`${dataTestid}-dropdown-settings`}>Settings</span>,
            icon: <SettingOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            label: <span data-testid={`${dataTestid}-dropdown-logout`}>Logout</span>,
            icon: <LogoutOutlined />,
            danger: true,
        },
    ];


    return (
        <Dropdown 
            menu={{
                items,
                onClick: onMenuClick,
            }}
            placement="bottomLeft">
            <Button data-testid={`${dataTestid}-dropdown`}>
                <Space>
                    {user?.name}
                    <DownOutlined />
                </Space>
            </Button>
        </Dropdown>

    )
}
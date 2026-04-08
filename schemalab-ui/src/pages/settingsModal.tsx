import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, message } from 'antd';
import { useAuth, PasswordResetType, UpdateName } from '../contexts/auth-context';
import './authentication/authentication.scss';

interface FormState {
    first_name: string | undefined,
    last_name: string | undefined,
    oldPassword: string,
    newPassword: string,
    passwordConfirm: string,
}

interface SettingsProps {
    dataTestid: string
}


export const SettingsModal = ({dataTestid}: SettingsProps) => {
    const { settings, setSettings, updateName, resetPasswordAuthenticated, user } = useAuth();
    const [reset, setReset] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [firstName = "", ...rest] = (user?.name ?? "").split(" ");
    const lastName = rest.join(" ");


    // Data for inputs
    const [form, setForm] = useState<FormState>({
        first_name: firstName,
        last_name: lastName,
        oldPassword: "",
        newPassword: "",
        passwordConfirm: "",
    });

    const updateField = (field: keyof FormState, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    // fetch the name
    useEffect(() => {

    })

    const handleNameUpdate = async () => {
        if (form.newPassword === form.passwordConfirm) {
            if (!form.first_name) return error("Invalid first name entered");
            if (!form.last_name) return error("Invalid last name entered");
            const nameObj: UpdateName = {
                first_name: form.first_name,
                last_name: form.last_name,
            }
            await updateName(nameObj);
            setConfirmLoading(false);
            success("Changes have applied successful");
            return setSettings(false);
        }
        return error("Error occurred.");
    }

    const handlePasswordReset = async () => {
        setConfirmLoading(true);
        if (!form.newPassword || !form.oldPassword || !form.passwordConfirm) {
            return error("One of the password fields was missing.");
        }

        if (form.newPassword === form.passwordConfirm) {
            const passwordObj: PasswordResetType = {
                old_password: form.oldPassword,
                new_password: form.newPassword,
                // remember_me: form.remember_me,
            }
            await resetPasswordAuthenticated(passwordObj);
            setConfirmLoading(false);
            return success("Password reset successful");
        }
        error("Passwords do not match or old password is incorrect");
        setConfirmLoading(false);
    }

    const success = (message: string) => {
        messageApi.open({
            type: 'success',
            content: 'This is a success message',
        });
    };

    const error = (message: string) => {
        messageApi.open({
            type: 'error',
            content: 'This is an error message',
        });
    };

    return (
        <>
            {contextHolder}
            <Modal
                title="Settings"
                centered
                open={settings}
                onOk={() => handleNameUpdate()}
                okButtonProps={{
                    'data-testid': `${dataTestid}-modal-ok`
                }}
                onCancel={() => setSettings(false)}
                cancelButtonProps={{
                    'data-testid': `${dataTestid}-modal-cancel`
                }}
                className="settings"
            >
                <div className="content">
                    <div className="name-change">
                        <div className="field">
                            <p className="label">First Name:</p>
                            <Input className="input" value={form.first_name} onChange={e => { updateField("first_name", e.target.value); }} data-testid={`${dataTestid}-modal-first_name`}/>
                        </div>
                        <div className="field">
                            <p className="label">Last Name:</p>
                            <Input className="input" value={form.last_name} onChange={e => { updateField("last_name", e.target.value); }} data-testid={`${dataTestid}-modal-last_name`}/>
                        </div>
                    </div>
                    <div className="reset">
                        <p className="label">Reset password:</p>
                        <Button onClick={() => setReset(true)}>
                            Reset Password
                        </Button>
                    </div>
                </div>
            </Modal>
            <Modal
                title="Reset Password"
                open={reset}
                onOk={() => handlePasswordReset()}
                onCancel={() => setReset(false)}
                confirmLoading={confirmLoading}
            >
                <Input.Password placeholder="old password" value={form.oldPassword} onChange={e => { updateField("oldPassword", e.target.value); }}/>
                <Input.Password placeholder="new password" value={form.newPassword} onChange={e => { updateField("newPassword", e.target.value); }}/>
                <Input.Password placeholder="confirm new password" value={form.passwordConfirm} onChange={e => { updateField("passwordConfirm", e.target.value); }}/>
                <Button onClick={() => handlePasswordReset()}>Reset Password</Button>
            </Modal>
        </>

    )
}
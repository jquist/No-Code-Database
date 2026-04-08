import { useState } from "react";
import { useAuth, PasswordLinkType } from "../../contexts/auth-context";
import { UserOutlined, CloseOutlined } from '@ant-design/icons';
import { Input, Button } from 'antd';
// import type { CheckboxProps } from 'antd';
import './authentication.scss';
import { useNavigate } from "react-router-dom";

interface FormState {
    email: string;
    emailValid: boolean;
    showErrorIcon: boolean;
}

export const ResetTrigger = () => {
    const { requestPasswordReset } = useAuth();
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [form, setForm] = useState<FormState>({
        email: "",
        emailValid: true,
        showErrorIcon: false,
    });
    const navigate = useNavigate();

    const updateField = (field: keyof FormState, value: string | boolean) => {
        setForm(prev => ({ ... prev, [field]: value}));
    }

    const handleSubmit = () => {
        if (!isEmailValid) {
            updateField("showErrorIcon", true);
            updateField("emailValid", false);
            setTimeout(() => updateField("showErrorIcon", false), 3000);
        } else {
            setBtnLoading(true);
            const resetObj: PasswordLinkType = {
                email: form.email,
            }
            requestPasswordReset(resetObj);
        }
    }

    const isEmailValid = form.email.trim().length > 0;

    return (
        <div className="request_reset">
            <div className="heading">
                <h1 className="title">Request to Reset Password</h1>
                <p className="description">Enter you email, to get a password reset link.</p>
            </div>

            <div className="input">
                <p className="label">Email:</p>
                <Input 
                    placeholder="Enter Email"
                    prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, ..25)', marginRight: "4px"}} />}
                    className={`input-box ${!form.emailValid ? "invalid" : ""}`}
                    value={form.email}
                    onChange={e => { updateField("email", e.target.value); updateField("emailValid", true); }}
                />
            </div>

            <div className="send">
                <Button type="primary" loading={btnLoading} onClick={handleSubmit} className={form.showErrorIcon ? "error" : undefined} block>{form.showErrorIcon ? (<CloseOutlined />) : ("Request Reset")}</Button>
                 <a onClick={() => navigate('/login')} className="link">Login</a>
            </div>
        </div>
    );
}
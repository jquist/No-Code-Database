import { useState } from "react";
import { useAuth, passwordResetConfirm } from "../../contexts/auth-context";
import { CloseOutlined, LockOutlined } from '@ant-design/icons';
import { Input, Button } from 'antd';
// import type { CheckboxProps } from 'antd';
import './authentication.scss';
import { useNavigate } from "react-router-dom";

interface FormState {
    password: string;
    passwordValid: boolean;
    passwordConfirm: string;
    passwordConfirmValid: boolean;
    showErrorIcon: boolean;
}

export const ResetConfirm = () => {
    const { resetPasswordConfirmation } = useAuth();
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [form, setForm] = useState<FormState>({
        password: "",
        passwordValid: true,
        passwordConfirm: "",
        passwordConfirmValid: true,
        showErrorIcon: false,
    });
    const navigate = useNavigate();

    const updateField = (field: keyof FormState, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    const handleSubmit = () => {
        if (!isPasswordValid) {
            updateField("passwordValid", false);
        }
        if (!isPasswordConfirmValid) {
            updateField("passwordConfirmValid", false);
        }
        if (!isPasswordValid || !isPasswordConfirmValid) {
            updateField("showErrorIcon", true);
            setTimeout(() => updateField("showErrorIcon", false), 3000);
        } else {
            setBtnLoading(true);
            if (form.password === form.passwordConfirm) {
                const resetObj: passwordResetConfirm = {
                    new_password: form.password,
                }
                return resetPasswordConfirmation(resetObj);
            }
            updateField("showErrorIcon", true);
            updateField("passwordConfirmValid", false);
            setTimeout(() => updateField("showErrorIcon", false), 3000);

        }
    }

    const isPasswordConfirmValid = form.passwordConfirm.trim().length > 0;
    const isPasswordValid = form.password.trim().length > 0;

    return (
        <div className="request_reset">
            <div className="heading">
                <h1 className="title">Request to Reset Password</h1>
                <p className="description">Enter you email, to get a password reset link.</p>
            </div>

            <div className="input">
                <p className="label">Password</p>
                <Input.Password 
                    placeholder="Enter Password"
                    prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, ..25)', marginRight: "4px"}} />}
                    className={`input-box ${!form.passwordValid ? "invalid" : ""}`}
                    value={form.password}
                    onChange={e => {updateField("password", e.target.value); updateField("passwordValid", true); }}
                />
            </div>

            <div className="input">
                <p className="label">Confirm Password</p>
                <Input.Password 
                    placeholder="Enter Password"
                    prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, ..25)', marginRight: "4px"}} />}
                    className={`input-box ${!form.passwordConfirmValid ? "invalid" : ""}`}
                    value={form.passwordConfirm}
                    onChange={e => {updateField("passwordConfirm", e.target.value); updateField("passwordConfirmValid", true); }}
                />
            </div>

            <div className="create">
                <Button type="primary" loading={btnLoading} onClick={handleSubmit} className={form.showErrorIcon ? "error" : undefined} block>{form.showErrorIcon ? (<CloseOutlined />) : ("Reset Password")}</Button>
            </div>
        </div>
    );
}
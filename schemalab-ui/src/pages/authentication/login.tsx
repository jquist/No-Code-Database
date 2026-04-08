import { useState } from "react";
import { useAuth, LoginType } from "../../contexts/auth-context";
import { UserOutlined, LockOutlined, CloseOutlined } from '@ant-design/icons';
import { Input, Button, Checkbox } from 'antd';
// import type { CheckboxProps } from 'antd';
import { useNavigate } from "react-router-dom";
import './authentication.scss';

interface FormState {
    email: string;
    emailValid: boolean;
    password: string;
    passwordValid: boolean;
    remember_me: boolean;
    showErrorIcon: boolean;
}

export const Login = () => {
    const { login } = useAuth();
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [form, setForm] = useState<FormState>({
        email: "",
        emailValid: true,
        password: "",
        passwordValid: true,
        remember_me: false,
        showErrorIcon: false,
    });
    const navigate = useNavigate();

    const updateField = (field: keyof FormState, value: string | boolean) => {
        setForm(prev => ({ ... prev, [field]: value}));
    }

    const handleSubmit = async () => {
        if (!isEmailValid) {
            updateField("emailValid", false);
        }
        if (!isPasswordValid) {
            updateField("passwordValid", false);
        }
        if (!isEmailValid || !isPasswordValid) {
            updateField("showErrorIcon", true);
            setTimeout(() => updateField("showErrorIcon", false), 3000);
        } else {
            setBtnLoading(true);
            const loginObj: LoginType = {
                email: form.email,
                password: form.password,
                // remember_me: form.remember_me,
            }
            const result = await login(loginObj);
            if (!result) {
                setBtnLoading(false);
                updateField("passwordValid", false);
            }
        }
    }

    const handleForgotPassword = () => {
        navigate('/reset');
    }

    // const onChange: CheckboxProps['onChange'] = (e) => {
    //     updateField("remember_me", e.target.checked);
    // }

    const isEmailValid = form.email.trim().length > 0;
    const isPasswordValid = form.password.trim().length > 0;

    return (
        <div className="login">
            <div className="heading">
                <h1 className="title" data-testid="title">Login to Account</h1>
                <p className="description">Login to your existing account to continue designing your database.</p>
            </div>

            <div className="input">
                <p className="label">Email</p>
                <Input 
                    placeholder="Enter Email"
                    prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, ..25)', marginRight: "4px"}} />}
                    className={`input-box ${!form.emailValid ? "invalid" : ""}`}
                    value={form.email}
                    onChange={e => { updateField("email", e.target.value); updateField("emailValid", true); }}
                    data-testid="email_input"
                />
            </div>

            <div className="input">
                <p className="label">Password</p>
                <Input.Password 
                    placeholder="Enter Password"
                    prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, ..25)', marginRight: "4px"}} />}
                    className={`input-box ${!form.passwordValid ? "invalid" : ""}`}
                    value={form.password}
                    onChange={e => {updateField("password", e.target.value); updateField("passwordValid", true); }}
                    data-testid="password_input"
                />
            </div>

            <a onClick={handleForgotPassword} className="forgot">Forgot your password?</a>

            {/* <div className="checkbox">
                <Checkbox onChange={onChange}>Remember Me</Checkbox>
            </div> */}

            <div className="create">
                <Button type="primary" loading={btnLoading} onClick={handleSubmit} className={form.showErrorIcon ? "error" : undefined} block data-testid="login_button">
                    {form.showErrorIcon ? (<CloseOutlined />) : ("Login")}
                </Button>
                <p className="comment">Don't Have an Account? <a onClick={() => navigate('/register')} className="link">Register now.</a></p>
                {/* <a onClick={changeStep} className="link">Forgot password?</a> href to a screen to enter email */}
            </div>
        </div>
    );
}
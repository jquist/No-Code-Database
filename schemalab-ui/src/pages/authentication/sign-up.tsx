import { useState } from "react";
import { UserOutlined, LockOutlined, MailOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { Input, Button } from 'antd';
import { passwordConstraintContent } from './passwordRegex/passwordConstraints';
import './authentication.scss';
import { testNonEmpty, testLength, testHasLower, testHasUpper, testHasNumber, testHasSpecial } from './passwordRegex/passwordValidation';
import { useAuth, RegisterType } from "../../contexts/auth-context";
import { useNavigate } from "react-router-dom";

interface FormState {
    first_name: string;
    first_nameValid: boolean;
    last_name: string;
    last_nameValid: boolean;
    email: string;
    emailValid: boolean;
    password: string;
    passwordValid: boolean;
    showErrorIcon: boolean;
}

export const Register = () => {
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [form, setForm] = useState<FormState>({
        first_name: "",
        first_nameValid: true,
        last_name: "",
        last_nameValid: true,
        email: "",
        emailValid: true,
        password: "",
        passwordValid: true,
        showErrorIcon: false,
    });
    const { register } = useAuth();
    const navigate = useNavigate();

    const updateField = (field: keyof FormState, value: string | boolean) => {
        setForm(prev => ({ ... prev, [field]: value}));
    }

    const validations = {
        notEmpty: testNonEmpty({ password: form.password }),
        minLength: testLength({ password: form.password }),
        lowerCase: testHasLower({ password: form.password }),
        upperCase: testHasUpper({ password: form.password }),
        number: testHasNumber({ password: form.password }),
        special: testHasSpecial({ password: form.password }),

    }

    const handleSubmit = () => {
        if (!isFirst_NameValid) {
            updateField("first_nameValid", false);
        }
        if (!isLast_NameValid) {
            updateField("first_nameValid", false);
        }
        if (!isEmailValid) {
            updateField("emailValid", false);
        }
        if (!isPasswordValid) {
            updateField("passwordValid", false);
        }

        if (!isFirst_NameValid || !isLast_NameValid || !isEmailValid) {
            updateField("showErrorIcon", true);
            setTimeout(() => updateField("showErrorIcon", false), 3000);
        } else {
            setBtnLoading(true);
            const registerObj: RegisterType = {
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
            }
            register(registerObj);
        }
    }

    const isPasswordValid = Object.values(validations).every(Boolean);
    const isFirst_NameValid = form.first_name.trim().length > 0;
    const isLast_NameValid = form.first_name.trim().length > 0;
    const isEmailValid = form.email.trim().length > 0;

    return (
        <div className="register">
            <div className="heading">
                <h1 className="title" data-testid="title">Create Account</h1>
                <p className="description">Sign up to start designing your first database.</p>
            </div>

            <div className="input">
                <p className="label">First Name</p>
                <Input 
                    placeholder="Enter First Name"
                    prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, ..25)', marginRight: "4px"}} />}
                    className={`input-box ${!form.first_nameValid ? "invalid" : ""}`}
                    value={form.first_name}
                    onChange={e => { updateField("first_name", e.target.value); updateField("first_nameValid", true); }}
                    data-testid="firstName_input"
                />
            </div>

            <div className="input">
                <p className="label">Last Name</p>
                <Input 
                    placeholder="Enter Last Name"
                    prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, ..25)', marginRight: "4px"}} />}
                    className={`input-box ${!form.last_nameValid ? "invalid" : ""}`}
                    value={form.last_name}
                    onChange={e => { updateField("last_name", e.target.value); updateField("last_nameValid", true); }}
                    data-testid="lastName_input"
                />
            </div>

            <div className="input">
                <p className="label">Email</p>
                <Input 
                    placeholder="Enter Email"
                    prefix={<MailOutlined style={{ color: 'rgba(0, 0, 0, ..25)', marginRight: "4px"}} />}
                    className={`input-box ${!form.emailValid ? "invalid" : ""}`}
                    value={form.email}
                    onChange={e => {updateField("email", e.target.value); updateField("emailValid", true); }}
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

            <div className="validations">
                { passwordConstraintContent.map(constraint => {
                    const isValid = validations[constraint.name as keyof typeof validations];
                    return (
                        <div key={constraint.id} className="item">
                            { isValid ? (
                                <CheckOutlined className="check" />
                            ) : (
                                <CloseOutlined className="cross" />
                            )}
                            <span className="message">{constraint.message}</span>
                        </div>
                    );
                })}
            </div>

            <div className="create">
                <Button type="primary" loading={btnLoading} onClick={handleSubmit} className={form.showErrorIcon ? "error" : undefined} block data-testid="register_button">
                    {form.showErrorIcon ? (<CloseOutlined />) : ("Create Account")}
                </Button>
                <p className="comment">Already Have an Account? <a onClick={() => navigate('/login')} className="link">Sign in now.</a></p>
            </div>
        </div>
    );
}
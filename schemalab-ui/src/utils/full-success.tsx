import { Result, Button } from 'antd';
import { useNavigate } from "react-router-dom";

interface FullSuccessProps {
    title: string,
    subTitle: string,
    buttonLabel: string,
    buttonURL: string;
}

export const FullSuccess = ({title, subTitle, buttonLabel, buttonURL}: FullSuccessProps) => {
    const navigate = useNavigate();

    return (
        <Result
            status="success"
            title={title}
            subTitle={subTitle}
            extra={[
                <Button onClick={() => navigate(buttonURL)}>{buttonLabel}</Button>,
            ]}
        >
        </Result>
    )
}
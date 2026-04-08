import { Result, Button } from 'antd';

export const FullError = () => {
    return (
        <Result
            status="error"
            title="Action Failed"
            subTitle="An error occurred during processing. Please try again later."
            extra={[
                <Button>Try again</Button>,
            ]}
        >
        </Result>
    )
}
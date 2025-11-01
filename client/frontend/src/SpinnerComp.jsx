import './App.css'

export const SpinnerComp = () => {
    
    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div id="spinner"></div>
            </div>
            <p style={{fontSize: "0.6rem"}}>Updating...</p>
        </div>

    )
}
import axios from 'axios';
import React, { Component } from 'react';
class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            intake:[]
        };
    }
    medicine=async() =>{
        const answer = await axios.get("https://64015d57-ae66-4061-9d92-c81956d3738e.mock.pstmn.io/test");
        this.setState({intake:answer.data.data.intake});
    }
    render() {
        return (
            <div>
                <button onClick={this.medicine}>표시하기</button>
                {JSON.stringify(this.state.intake)}
            </div>
        );
    }
}

export default Test;
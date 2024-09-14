import React, { useState, useEffect } from 'react';

import '../App.css';
import Axios from 'axios';
import '../components/component.css';
import "react-datepicker/dist/react-datepicker.css";
import { Line } from 'react-chartjs-2';
import ErrorModal from '../components/error-modal.component';

import { Container,  Button, Col, Row, InputGroup, FormControl } from 'react-bootstrap';

const CryptoDashboard = () => {
    const [searchItem, setSearchItem] = useState("");
    const [coinName, setCoinName] = useState("");
    const [weeklyHistory, setWeeklyHistory] = useState({ x: [], y: [] });
    const [dailyHistory, setDailyHistory] = useState({ x: [], y: [] });
    const [monthlyHistory, setMonthlyHistory] = useState({ x: [], y: [] });
    const [errorModalShow, setErrorModalShow] = useState(false);
    const [error, setError] = useState();
    const [exchangeRate, setExchangeRate] = useState();
    const [healthIndex, setHealthIndex] = useState({ fcasRating: "N/A", fcasScore: "N/A", developerScore: "N/A", utilityScore: "N/A", marketMaturityScore: "N/A" });

    const [amountToConvert, setAmountToConvert] = useState({ currency: coinName, amount: 0 });
    const [convertedAmount, setConvertedAmount] = useState({ currency: "USD", amount: 0 });
    
    useEffect(() => {

        const checkLoggedIn = async () => {
            if (localStorage.getItem('jwt')) {

                Axios({
                    method: 'get',
                    url: 'http://localhost:5000/api/users/isAuthenticated',
                    headers: {
                        'Authorization': localStorage.getItem('jwt'),
                    }
                }).catch(err => {
                    window.location = '/';
                    localStorage.removeItem('jwt');
                });
            } else {
                window.location = '/';

            }

        }
        checkLoggedIn();



    }, []);

    const getDailyPriceHistory = async () => {
        try {
            await Axios({
                method: 'post',
                url: 'http://localhost:5000/api/protected/vantage-api/getHistory',
                headers: {
                    'Authorization': localStorage.getItem('jwt'),
                },
                data: {
                    "choice": "DAILY",
                    "currencyFrom": searchItem,
                    "currencyTo": "USD"
                }
            }).then(res => {
                console.log("DAILY PRICE", res.data);

                const dailySeries = res.data["Time Series (Digital Currency Daily)"]

                // console.log("daily series data :", dailySeries)
                var series = Object.keys(dailySeries).map(day => {
                    let value = dailySeries[day]["4. close"];
                    // console.log("Raw Value:", value); // Log the raw value

                    // console.log(`Closing Price on ${day}:`, value);  // Log the closing price
            
                
                    // Clean up the value by removing any commas or extra spaces
                    value = value.replace(/,/g, '').trim();  // Removes commas and trims spaces
                
                    return { 
                        day: day, 
                        value: Number(value)  // Convert cleaned-up string to number
                    };
                });

                console.log("Series Data:", series);

                var x_axis = [];
                var y_axis = [];
                var days;
                if (series.length < 100) {
                    days = series.length;
                } else {
                    days = 100;
                }
                for (var index = 0; index < days; index++) {
                    x_axis.push(series[index].day);
                    y_axis.push(series[index].value)

                }
                x_axis.reverse();
                y_axis.reverse();

                  // Log the x_axis and y_axis to check values before updating state
        // console.log("X-axis (Dates):", x_axis);
        // console.log("Y-axis (Prices):", y_axis);

                setDailyHistory({ x: x_axis, y: y_axis });

            });

        } catch (err) {

            // setError(err.response.data.Error);
            // setErrorModalShow(true);
            resetGraphs(err);

        }
    }

    const getWeeklyPriceHistory = async () => {
        try {
            await Axios({
                method: 'post',
                url: 'http://localhost:5000/api/protected/vantage-api/getHistory',
                headers: {
                    'Authorization': localStorage.getItem('jwt'),
                },
                data: {
                    "choice": "WEEKLY",
                    "currencyFrom": searchItem,
                    "currencyTo": "USD"
                }
            }).then(res => {
                // console.log("WEEKELY PRICE", res.data);
                const weeklySeries = res.data["Time Series (Digital Currency Weekly)"]
                const series = Object.keys(weeklySeries).map(day => {
                    return { day: day, value: weeklySeries[day]["4. close"] }
                });
                var x_axis = [];
                var y_axis = [];
                var weeks;
                if (series.length < 100) {
                    weeks = series.length;
                } else {
                    weeks = 100;
                }
                for (var index = 0; index < weeks; index++) {
                    x_axis.push(series[index].day);
                    y_axis.push(series[index].value)

                }
                x_axis.reverse();
                y_axis.reverse();
                setWeeklyHistory({ x: x_axis, y: y_axis });
            });
        } catch (err) {
            // setError(err.response.data.Error);
            // setErrorModalShow(true);
            // resetGraphs(err);

        }
    }
    const getMonthlyPriceHistory = async () => {
        try {
            await Axios({
                method: 'post',
                url: 'http://localhost:5000/api/protected/vantage-api/getHistory',
                headers: {
                    'Authorization': localStorage.getItem('jwt'),
                },
                data: {
                    "choice": "MONTHLY",
                    "currencyFrom": searchItem,
                    "currencyTo": "USD"
                }
            }).then(res => {
                // console.log(res.data);
                const monthlySeries = res.data["Time Series (Digital Currency Monthly)"]
                const series = Object.keys(monthlySeries).map(day => {
                    return { day: day, value: monthlySeries[day]["4. close"] }
                });
                var x_axis = [];
                var y_axis = [];
                var months;
                if (series.length < 100) {
                    months = series.length;
                } else {
                    months = 100;
                }
                for (var index = 0; index < months; index++) {
                    x_axis.push(series[index].day);
                    y_axis.push(series[index].value)

                }
                x_axis.reverse();
                y_axis.reverse();
                setMonthlyHistory({ x: x_axis, y: y_axis });



            });

        } catch (err) {
            // setError(err.response.data.Error);
            // setErrorModalShow(true);
            // resetGraphs(err);
        }
    }

    const resetGraphs = (err) => {
        setCoinName("Invalid Coin");

        // console.log(err.response.data.Error+" in reset");
        // setError(err.response.data.Error);
            // Check if err.response and err.response.data exist
    if (err.response && err.response.data) {
        console.log(err.response.data.Error + " in reset");
        setError(err.response.data.Error);
    } else {
        console.log("Error:", err);  // Log the full error for debugging
        setError("An unknown error occurred");
    }
        setErrorModalShow(true);

        setDailyHistory({ x: [], y: [] });

        setWeeklyHistory({ x: [], y: [] });
        setMonthlyHistory({ x: [], y: [] });
        setAmountToConvert({ amount: 0 });
        setConvertedAmount({ amount: 0, currency: "USD" });
    }

    const getHealthIndex = async () => {

        try {
            await Axios({
                method: 'post',
                url: 'http://localhost:5000/api/protected/vantage-api/getCryptoRating',
                headers: {
                    'Authorization': localStorage.getItem('jwt'),
                },
                data: {
                    "currencyName": searchItem
                }
            }).then(res => {
                console.log("HEALTH INDEX", res.data);
                setHealthIndex({
                    fcasRating: res.data["Crypto Rating (FCAS)"]["3. fcas rating"], fcasScore: res.data["Crypto Rating (FCAS)"]["4. fcas score"],
                    developerScore: res.data["Crypto Rating (FCAS)"]["5. developer score"], marketMaturityScore: res.data["Crypto Rating (FCAS)"]["6. market maturity score"],
                    utilityScore: res.data["Crypto Rating (FCAS)"]["7. utility score"]
                });
            });

        } catch (err) {
            console.log(err);
            // console.log(err.response.data.Error+" in health");

            // setError(err.response.data.Error);
            // setErrorModalShow(true);
            // resetGraphs(err);
        }
    }
    const getExchangeRate = async () => {
        try {
            await Axios({
                method: 'post',
                url: 'http://localhost:5000/api/protected/vantage-api/getExchangeRate',
                headers: {
                    'Authorization': localStorage.getItem('jwt'),
                },
                data: {
                    "currencyFrom": searchItem,
                    "currencyTo": "USD"
                }
            }).then(res => {
                setExchangeRate(res.data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
                console.log("exchange rate data:", res.data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
            });

        } catch (err) {
            console.log(err);
            // console.log(err.response.data.Error + " in exchange");
            // setError(err.response.data.Error);
            // setErrorModalShow(true);
            // resetGraphs(err);
        }
    }
    const swapConversion = () => {
        console.log("REACHHHHHHHHHH in swap");

        var amountToSwap = amountToConvert;
        setAmountToConvert({ currency: convertedAmount.currency,amount:amountToConvert.amount});
        setConvertedAmount({ currency: amountToSwap.currency, amount: 0 });

    }
    const convertCurrency = () => {
        console.log("coinName :::", coinName);

        console.log("Search item", searchItem);
        console.log("REACHHHHHHHHHH");
        setAmountToConvert({amount:amountToConvert,currency:amountToConvert.currency});
        console.log("Amount to convert", amountToConvert);
        console.log("Exchange rate", exchangeRate);
        console.log("Converted amount", amountToConvert);

        if (convertedAmount.currency === "USD") {
            setConvertedAmount({ amount: exchangeRate * amountToConvert.amount, currency: convertedAmount.currency });
        } else {
            console.log("REACHHHHHHHHHH in else");

            setConvertedAmount({ amount: amountToConvert.amount / exchangeRate, currency: convertedAmount.currency });

        }

    }
    // const onSubmit = async (e) => {
    //     try {
    //         try{
    //             setCoinName(searchItem);
    //         }catch(err){
    //             console.log("setcoin error", err);
    //         }
    //         setAmountToConvert({ currency: searchItem });
    //         e.preventDefault();

    //         console.log("SEARCH ITEM", searchItem)
    //         console.log("coinnnammee", coinName);
    //         e.target.reset();

    //         await getDailyPriceHistory();
    //         await getWeeklyPriceHistory();
    //         await getMonthlyPriceHistory();
    //         // await getHealthIndex();
    //         await getExchangeRate();
    //         await swapConversion();
    //         await convertCurrency();

    //         setSearchItem("");
    //     } catch (err) {
    //         console.log("reach");
    //         console.log(err);
    //         // setError(err.response.data.Error);
    //         // setModalShow(true);
    //     }
        
    // }

    const onSubmit = async (e) => {
        try {
            setCoinName(searchItem);
            setAmountToConvert({ currency: searchItem });
            e.preventDefault();
    
            console.log("SEARCH ITEM", searchItem); // This will log the correct searchItem value
            console.log("COIN NAME SET", coinName)
    
            // e.target.reset();  // You can reset the form if needed after processing the form submission
    
            await getDailyPriceHistory();
            await getWeeklyPriceHistory();
            await getMonthlyPriceHistory();
            // await getHealthIndex();
            await getExchangeRate();
            await swapConversion();
            await convertCurrency();
    
            setSearchItem("");
        } catch (err) {
            console.log("Error occurred:", err);
        }
    };
    

    useEffect(() => {
        console.log("Updated Coin Name:", coinName);
    }, [coinName]);
    return (

        <Container>
            <ErrorModal
                show={errorModalShow}
                onHide={() => setErrorModalShow(false)}
                error={error}
            />
            <form onSubmit={onSubmit} className="form-search-coin-group">

                <Row>

                    <Col xs={8}>
                        <div className="form-group">
                            <input type="text" className="form-control currency-search" placeholder="Enter ISO currency code e.g BTC" onChange={(e) => setSearchItem(e.target.value)} />
                        </div>
                    </Col>
                    <Col xs={4}>
                        <Button className="text-uppercase search-btn" variant="dark" type="submit" disabled={searchItem <= 0}>Search</Button>
                    </Col>

                </Row>
            </form>
            <Row>
                {/* <Col> */}
                    <div className="card conversion-input-card text-center">
                        <div className="card-body flex items-center justify-center h-screen border-2 border-gray-300">
                            <h5 className="card-title text-center">Currency Conversion</h5>
                            <form className="form-signin">
                                {/* <Row> */}
                                    {/* <Col xs={12} > */}
                                        <InputGroup className="mb-3 amount-to-convert">
                                            <FormControl
                                                placeholder="Amount"
                                                aria-label="Amount"
                                                aria-describedby="Amount"

                                                onChange={(e) => setAmountToConvert({ amount: e.target.value, currency: amountToConvert.currency })}

                                                type="number"
                                                step="any"
                                                min="0"
                                            />
                                            <InputGroup.Append >
                                                <InputGroup.Text id="Amount" >{amountToConvert.currency}</InputGroup.Text>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    {/* </Col> */}
                                    <Col xs={12} >
                                        <Button type="button" className="swap-button" onClick={swapConversion}><img alt="" src="https://www.pngrepo.com/png/55685/180/transfer-arrows.png" width="30px"></img></Button>
                                    </Col>
                                    <Col xs={12} >
                                        <InputGroup className="mb-3">
                                            <FormControl
                                                // placeholder="Amount"
                                                aria-label="Amount"
                                                aria-describedby="Amount"
                                                value={convertedAmount.amount || 0}
                                                readOnly
                                                step="any"

                                            />
                                            <InputGroup.Append>
                                                <InputGroup.Text id="Amount">{convertedAmount.currency}</InputGroup.Text>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Col>
                                {/* </Row> */}

                                <button className="btn btn-lg btn-primary btn-block text-uppercase input-expense-btn" type="button" onClick={convertCurrency}>Convert</button>

                            </form>
                        </div>
                    </div>
                {/* </Col> */}
                {/* <Col xs={12} md={6}> */}
                    {/* <div className="card health-index-card"> */}
                        {/* <div className="card-body">
                            <h4 className="card-title text-center">{coinName} Health Index</h4>
                            <h6>Fcas rating: {healthIndex.fcasRating}</h6>
                            <h6>Fcas score: {healthIndex.fcasScore}</h6>
                            <h6>Developer Score: {healthIndex.developerScore}</h6>
                            <h6>Market maturity score: {healthIndex.marketMaturityScore}</h6>
                            <h6>Utility score: {healthIndex.utilityScore}</h6>
                            <div className="healthIndexDescription">
                                <p>*All scores out of 1000
                            </p>
                            </div>
                        </div> */}
                    {/* </div> */}
                {/* </Col> */}
            </Row>
            <Row>
                <Col xs={12} >
                    <div className="history-chart">
                    <Line
                        data={{
                            labels: dailyHistory.x,
                            datasets: [
                                {
                                    label: 'Amount (USD)',
                                    fill: false,
                                    lineTension: 1,
                                    backgroundColor: 'red',
                                    borderColor: 'rgba(100,100,100,1)',
                                    borderWidth: 2,
                                    data: dailyHistory.y
                                }
                            ]
                        }}
                        options={{
                            title: {
                                display: true,
                                text: coinName + ' Daily price (past 100 days)',
                                fontSize: 20
                            },
                            legend: {
                                display: false,

                            },
                            responsive: true,
                            maintainAspectRatio: false,
                        }}
                        width={600}
                        height={600}
                        className="charts"

                    />
                    </div>
                </Col>


            </Row>
            <Row>
                <Col xs={12} >
                <div className="history-chart">

                    <Line
                        data={{
                            labels: weeklyHistory.x,
                            datasets: [
                                {
                                    label: 'Amount (USD)',
                                    fill: false,
                                    lineTension: 0,
                                    backgroundColor: 'rgba(75,192,192,1)',
                                    borderColor: 'rgba(0,0,0,1)',
                                    borderWidth: 2,
                                    data: weeklyHistory.y
                                }
                            ]
                        }}
                        options={{
                            title: {
                                display: true,
                                text: coinName + ' Weekly price (past 100 weeks)',
                                fontSize: 20
                            },
                            legend: {
                                display: false,

                            },
                            responsive: true,
                            maintainAspectRatio: false,
                        }}
                        width={600}
                        height={600}
                        className="charts"
                    />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xs={12} >
                <div className="history-chart month-chart">

                    <Line
                        data={{
                            labels: monthlyHistory.x,
                            datasets: [
                                {
                                    label: 'Amount (USD)',
                                    fill: false,
                                    lineTension: 0,
                                    backgroundColor: 'rgba(75,192,192,1)',
                                    borderColor: 'rgba(0,0,0,1)',
                                    borderWidth: 2,
                                    data: monthlyHistory.y
                                }
                            ]
                        }}
                        options={{
                            title: {
                                display: true,
                                text: coinName + ' Monthly price',
                                fontSize: 20
                            },
                            legend: {
                                display: false,

                            },
                            responsive: true,
                            maintainAspectRatio: false,
                        }}
                        width={600}
                        height={600}
                        className="charts"

                    />
                    </div>
                </Col>
            </Row>

        </Container>
    );
}

export default CryptoDashboard;
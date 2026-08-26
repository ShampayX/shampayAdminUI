import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Divider,
  LinearProgress,
  Paper,
  useTheme
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import QueueIcon from '@mui/icons-material/Queue';
import LoopIcon from '@mui/icons-material/Loop';


// 

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { inherits } from 'util';

interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface StatusCardItem {
  label: string;
  color: string;
  icon: React.ReactNode;
}

const DashboardContainDesign: React.FC = () => {
  const theme = useTheme();
  
  // Mock data
  const transactionVolume: string = "₹ 10,24,64,032.35";
  const count: string = "64,032";
  const countWithPercentage: string = "54,032 (55%)";
  const percentageUp: string = "60%";
  const percentageDown: string = "30%";
  
  // Donut chart data
  const chartData: ChartDataItem[] = [
    { label: 'Success', value: 90, color: '#4CAF50' },
    { label: 'Hold', value: 90, color: '#9C27B0' },
    { label: 'Pending', value: 2, color: '#FF9800' },
    { label: 'Queued', value: 2, color: '#E91E63' },
    { label: 'Failed', value: 8, color: '#F44336' },
    { label: 'Inprocess', value: 8, color: '#2196F3' },
  ];
  // Donut chart data
  const chartDataSecond: ChartDataItem[] = [
    { label: 'payout payment', value: 90, color: '#4CAF50' },
    { label: 'transfer', value: 80, color: '#9C27B0' },
    { label: 'ZOOPOKYC', value: 20, color: '#FF9800' },
    { label: 'XXXXX XXXX', value: 8, color: '#E91E63' },
  ];

  // Status card configuration
  const statusCards: StatusCardItem[] = [
    { label: 'Success', color: '#4CAF50', icon: <CheckCircleIcon /> },
    { label: 'Pending', color: '#FF9800', icon: <HourglassEmptyIcon /> },
    { label: 'Failed', color: '#F44336', icon: <ErrorIcon /> },
    { label: 'Hold', color: '#9C27B0', icon: <PauseCircleOutlineIcon /> },
    { label: 'Queued', color: '#E91E63', icon: <QueueIcon /> },
    { label: 'Inprocess', color: '#2196F3', icon: <LoopIcon /> },
  ];

  // data flow buttom
  const fundflowdata = [
    { type: 'Debit', amount: '₹ 10,24,64,032.35', count: '54,032 (55%)', change: '60%', positive: true, icon: <AccountBalanceWalletIcon /> },
    { type: 'Debit', amount: '₹ 10,24,64,032.35', count: '54,032 (55%)', change: '30%', positive: false, icon: <AccountBalanceWalletIcon /> },
    { type: 'Credit', amount: '₹ 10,24,64,032.35', count: '54,032 (55%)', change: '60%', positive: true, icon: <CreditCardIcon /> },
    { type: 'Credit', amount: '₹ 10,24,64,032.35', count: '54,032 (55%)', change: '30%', positive: false, icon: <CreditCardIcon /> },
  ];
  return (
    <Box sx={{ p: 3, backgroundColor: '#F4F4F4', minHeight: '100vh', borderRadius: 2 }}>
      {/* Transactions Statistics */}
      <Paper elevation={1} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" align="center">Transactions Statistics</Typography>
        </Box>
        
        <Grid container spacing={0}>
          {/* Volume Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">Volume</Typography>
              <Typography variant="h6">{transactionVolume}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                <Typography variant="body2" color="textSecondary">Today</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="body2">{count}</Typography>
              </Box>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">Volume</Typography>
              <Typography variant="h6">{transactionVolume}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                <Typography variant="body2" color="textSecondary">Yesterday</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="body2">{count}</Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Transaction Progress Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">Transaction</Typography>
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Today</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={80} 
                  sx={{ 
                    mt: 1, 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#e3f2fd',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#2196f3'
                    }
                  }} 
                />
              </Box>
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Yesterday</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  sx={{ 
                    mt: 1, 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#e3f2fd',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#2196f3'
                    }
                  }} 
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="caption">0</Typography>
                <Typography variant="caption">₹10L</Typography>
                <Typography variant="caption">₹50L</Typography>
                <Typography variant="caption">₹1cr</Typography>
                <Typography variant="caption">₹10cr</Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Count Progress Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">Count</Typography>
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Yesterday</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={70} 
                  sx={{ 
                    mt: 1, 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#fff3e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ff9800'
                    }
                  }} 
                />
              </Box>
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Today</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={50} 
                  sx={{ 
                    mt: 1, 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#fff3e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ff9800'
                    }
                  }} 
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="caption">0</Typography>
                <Typography variant="caption">10k</Typography>
                <Typography variant="caption">15k</Typography>
                <Typography variant="caption">25k</Typography>
                <Typography variant="caption">50k</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Status Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Status</Typography>
            </Box>
            
            {/* Donut Chart */}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, position: 'relative' }}>
              <Box 
                sx={{ 
                  width: 200, 
                  height: 200, 
                  position: 'relative',
                  borderRadius: '50%',
                  background: `conic-gradient(
                    ${chartData[0].color} 0% ${chartData[0].value / 2}%, 
                    ${chartData[1].color} ${chartData[0].value / 2}% ${(chartData[0].value + chartData[1].value) / 2}%, 
                    ${chartData[2].color} ${(chartData[0].value + chartData[1].value) / 2}% ${(chartData[0].value + chartData[1].value + chartData[2].value) / 2}%,
                    ${chartData[3].color} ${(chartData[0].value + chartData[1].value + chartData[2].value) / 2}% ${(chartData[0].value + chartData[1].value + chartData[2].value + chartData[3].value) / 2}%,
                    ${chartData[4].color} ${(chartData[0].value + chartData[1].value + chartData[2].value + chartData[3].value) / 2}% ${(chartData[0].value + chartData[1].value + chartData[2].value + chartData[3].value + chartData[4].value) / 2}%,
                    ${chartData[5].color} ${(chartData[0].value + chartData[1].value + chartData[2].value + chartData[3].value + chartData[4].value) / 2}% 100%
                  )`
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    width: '70%', 
                    height: '70%', 
                    backgroundColor: 'white', 
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center' 
                  }}
                >
                  <Typography variant="caption" color="textSecondary">Total Value</Typography>
                  <Typography variant="h4">72</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Status Legends */}
            <Grid container spacing={2} sx={{ p: 2 }}>
              {chartData.map((item, index) => (
                <Grid item xs={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                      sx={{ 
                        width: 30, 
                        height: 30, 
                        borderRadius: '50%', 
                        backgroundColor: item.color,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#fff',
                        fontSize: '0.75rem'
                        
                      }}
                    >
                      {statusCards[index].icon}
                    </Box>
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="h6">{item.value}%</Typography>
                      <Typography variant="caption" color="textSecondary">{item.label}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}



            </Grid>

          </Paper>

          {/* bhu 2ns donuts circle */}

          {/* another donuts chart start here */}

          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden',marginTop:'10px' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Transcation</Typography>
            </Box>
            
            {/* Donut Chart */}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, position: 'relative' }}>
              <Box 
                sx={{ 
                  width: 200, 
                  height: 200, 
                  position: 'relative',
                  borderRadius: '50%',
                  background: `conic-gradient(
                    ${chartData[0].color} 0% ${chartData[0].value / 2}%, 
                    ${chartData[1].color} ${chartData[0].value / 2}% ${(chartData[0].value + chartData[1].value) / 2}%, 
                    ${chartData[2].color} ${(chartData[0].value + chartData[1].value) / 2}% ${(chartData[0].value + chartData[1].value + chartData[2].value) / 2}%,
                    ${chartData[3].color} ${(chartData[0].value + chartData[1].value + chartData[2].value) / 2}% ${(chartData[0].value + chartData[1].value + chartData[2].value + chartData[3].value) / 2}%,
                    ${chartData[4].color} ${(chartData[0].value + chartData[1].value + chartData[2].value + chartData[3].value) / 2}% ${(chartData[0].value + chartData[1].value + chartData[2].value + chartData[3].value + chartData[4].value) / 2}%,
                    ${chartData[5].color} ${(chartData[0].value + chartData[1].value + chartData[2].value + chartData[3].value + chartData[4].value) / 2}% 100%
                  )`
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    width: '70%', 
                    height: '70%', 
                    backgroundColor: 'white', 
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'  
                  }}
                >
                  <Typography variant="caption" color="textSecondary">Total Value</Typography>
                  <Typography variant="h4">72</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Status Legends */}
            <Grid container spacing={2} sx={{ p: 2 }}>
              {chartDataSecond.map((item, index) => (
                <Grid item xs={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                      sx={{ 
                        width: 30, 
                        height: 30, 
                        borderRadius: '50%', 
                        backgroundColor: item.color,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#fff',
                        fontSize: '0.75rem'
                      }}
                    >
                      {statusCards[index].icon}
                    </Box>
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="h6">{item.value}%</Typography>
                      <Typography variant="caption" color="textSecondary">{item.label}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}



            </Grid>

          </Paper>
{/* end 2nd donuts */}




        </Grid>
        
        {/* Status Card Details */}
        <Grid item xs={12} md={8} >
          <Paper elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
            <Grid container spacing={0}  sx={{ 
           
        }} >
              {/* Status Cards */}
              {statusCards.map((status, index) => (
                <Grid item xs={12}  md={6} key={index} sx={{ borderBottom: '1px solid #eee', borderRight: index % 2 === 0 ? '1px solid #eee' : 'none' }}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 4, height: 20, backgroundColor: status.color, mr: 1, borderRadius: 1 }} />
                      <Typography variant="subtitle1" sx={{ color: status.color }}>{status.label}</Typography>
                    </Box>
                    
                    {/* Today's volume */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">Volume</Typography>
                      <Typography variant="h6">{transactionVolume}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="textSecondary">Today</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ArrowUpwardIcon sx={{ fontSize: 16, color: 'green' }} />
                          <Typography variant="body2" color="green">{percentageUp}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                        <Typography variant="body2" color="textSecondary">Count: {countWithPercentage}</Typography>
                      </Box>
                    </Box>
                    
                    {/* Yesterday's volume */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">Volume</Typography>
                      <Typography variant="h6">{transactionVolume}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="textSecondary">Yesterday</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ArrowDownwardIcon sx={{ fontSize: 16, color: 'red' }} />
                          <Typography variant="body2" color="error">{percentageDown}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                        <Typography variant="body2" color="textSecondary">Count: {count}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>



      </Grid>

{/* start fund flow  */}

<Box sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>Fund Flow</Typography>
      <Grid container spacing={2}>
        {fundflowdata.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ borderLeft: `5px solid ${item.positive ? '#4CAF50' : '#F44336'}` }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  {item.icon}
                  <Typography variant="subtitle1" color="text.secondary" ml={1}>{item.type}</Typography>
                </Box>
                <Typography variant="h5" fontWeight={600}>{item.amount}</Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  {item.positive ? (
                    <ArrowUpwardIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" sx={{ color: '#F44336' }} />
                  )}
                  <Typography
                    variant="body2"
                    color={item.positive ? '#4CAF50' : '#F44336'}
                    ml={0.5}
                  >
                    {item.change}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">Count: {item.count}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
    {/* fund flow end  */}


    </Box>
  );
};

export default DashboardContainDesign;
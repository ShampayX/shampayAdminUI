import React from 'react';
import Framegreen from '../../assets/images/Frame green.svg';
import Frameorange from '../../assets/images/Frame orange.svg';
import Graphgreen from '../../assets/images/Graph green.svg';
import Graphorange from '../../assets/images/Graph orange.svg';
import { Container, Grid, Stack, Button, Typography, Card, Box, CardContent } from '@mui/material';

const Value = [
  {
    status: 'Success',
    value: '0',
    color: '#36B37E',
    logo: Framegreen,
    graph: Graphgreen,
  },
  {
    status: 'Pending',
    value: '0',
    color: '#FFAB00',
    logo: Frameorange,
    graph: Graphorange,
  },
  {
    status: 'Failed',
    value: '0',
    color: '#FF5630',
    logo: Framegreen,
    graph: Graphgreen,
  },
  {
    status: 'In-progress',
    value: '0',
    color: '#3340A1',
    logo: Framegreen,
    graph: Graphgreen,
  },
  {
    status: 'Refund',
    value: '0',
    color: '#0000FF',
    logo: Framegreen,
    graph: Graphgreen,
  },
];

export default function AEPS(props: any) {
  return (
    <div>
      {' '}
      <Typography variant="h5">Number of Transaction</Typography>
      <Grid sx={{ display: 'flex', gap: 1, marginTop: '10px' }}>
        {Value.map((item, index) => {
          return (
            <Grid item key={index} xs={4} width={'100%'}>
              <Card
                sx={{
                  backgroundColor: '#FFFFFF',
                  //  width: '100%',
                  // maxWidth:'100%',
                  borderRadius: '15px',
                  boxShadow: '30px',
                }}
              >
                <CardContent>
                  <Stack
                    sx={{
                      fontFamily: 'Public Sans',
                      fontSize: '18px',
                      fontWeight: 600,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography style={{ color: item.color }}>{item.status}</Typography>
                    <Typography>{item.value}</Typography>
                  </Stack>
                  <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <img
                      src={item.logo}
                      alt="logo"
                      style={{
                        width: '40px',
                        height: '30px',
                      }}
                    />
                    <img
                      src={item.graph}
                      alt="logo"
                      style={{
                        width: '40px',
                        height: '30px',
                      }}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      fontFamily: 'Public Sans',
                      fontSize: '1px',
                      fontWeight: 600,
                      lineHeight: 'normal',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography>{'Amount'}</Typography>
                    <Typography>{'₹0'}</Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}

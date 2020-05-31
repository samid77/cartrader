import {Fragment} from 'react'
import {Formik, Form, Field} from 'formik'
import { GetServerSideProps } from 'next'
import router, { useRouter } from 'next/router'
import { getMakes, Make } from '../database/getMakes'
import { Button, FormControl, Grid, InputLabel, makeStyles, MenuItem, Paper, Select, SelectProps } from '@material-ui/core';
import { useEffect, useState } from 'react';

export interface HomeProps {
  makes: Make[];
}

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: 'auto',
    maxWidth: 500,
    padding: theme.spacing(3),
  },
}));

const prices = [1000,2000,5000,10000,15000,25000, 50000, 125000];

export default function Home({makes}: HomeProps) {
  const classes = useStyles();
  const {query} = useRouter();
  const initialValues = {
    make: query.make || 'all',
    model: query.model || 'all',
    minPrice: query.minPrice || 'all',
    maxPrice: query.maxPrice || 'all'
  }

  return (
    <Fragment>
      <Formik
        initialValues={initialValues}
        onSubmit={() => {}}
      >
        {({values}) => (
          <Form>
            <Paper elevation={5} className={classes.paper}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                  <InputLabel id="search-make">BRAND</InputLabel>
                  <Field name="make" as={Select} labelId="search-make" label="Brand">
                    <MenuItem value="all">
                      <em>All Brands</em>
                    </MenuItem>
                    {makes.map((make) => (
                      <MenuItem key={make.make} value={make.make}>
                        {`${make.make} (${make.count})`}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="search-model">MODEL</InputLabel>
                    <Field 
                      name="model"
                      as={Select}
                      labelId="search-model"
                      label="Model"
                    >
                      <MenuItem value="all">
                        <em>All Model</em>
                      </MenuItem>
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="search-min-price">MIN PRICE</InputLabel>
                    <Field 
                      name="minPrice"
                      as={Select}
                      labelId="search-min-price"
                      label="Minimum price"
                    >
                      <MenuItem value="all">
                        <em>No Minimum Price</em>
                      </MenuItem>
                      {prices.map(p => (
                        <MenuItem value={p}>{p}</MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="search-max-price">MAX PRICE</InputLabel>
                    <Field 
                      name="maxPrice"
                      as={Select}
                      labelId="search-max-price"
                      label="Maximum Price"
                    >
                      <MenuItem value="all">
                        <em>No Maximum Price</em>
                      </MenuItem>
                      {prices.map(p => (
                        <MenuItem value={p}>{p}</MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const makes = await getMakes();
  return {props: {makes}};
}

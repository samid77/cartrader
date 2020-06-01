import {Fragment} from 'react'
import {Formik, Form, Field, useField, useFormikContext} from 'formik'
import { GetServerSideProps } from 'next'
import router, { useRouter } from 'next/router'
import { getMakes, Make } from '../database/getMakes'
import { getModels, Model } from '../database/getModels'
import { Button, FormControl, Grid, InputLabel, makeStyles, MenuItem, Paper, Select, SelectProps } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { getAsString } from '../getAsString'
import useSWR from 'swr';

export interface SearchProps {
  makes: Make[];
  models: Model[];
  singleColumn? : boolean;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: 'auto',
    maxWidth: 500,
    padding: theme.spacing(3),
  },
}));

const prices = [1000,2000,5000,10000,15000,25000, 50000, 125000];

export default function Search({makes, models, singleColumn}: SearchProps) {
  const classes = useStyles();
  const {query} = useRouter();
  const smValue = singleColumn ? 12 : 6;
  const initialValues = {
    make: getAsString(query.make) || 'all',
    model: getAsString(query.model) || 'all',
    minPrice: getAsString(query.minPrice) || 'all',
    maxPrice: getAsString(query.maxPrice) || 'all'
  }

  return (
    <Fragment>
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          router.push({
            pathname: '/cars',
            query: {...values, page: 1}
          }, undefined, {shallow: true})
        }}
      >
        {({values}) => (
          <Form>
            <Paper elevation={5} className={classes.paper}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={smValue}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="search-make">Make</InputLabel>
                    <Field
                      name="make"
                      as={Select}
                      labelId="search-make"
                      label="Make"
                    >
                      <MenuItem value="all">
                        <em>All Makes</em>
                      </MenuItem>
                      {makes.map((make) => (
                        <MenuItem key={make.make} value={make.make}>
                          {`${make.make} (${make.count})`}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={smValue}>
                  <ModelSelect make={values.make} name="model" models={models} />
                </Grid>
                <Grid item xs={12} sm={smValue}>
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
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={smValue}>
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
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                 <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
}

export interface ModelSelectProps extends SelectProps {
  name: string;
  models: Model[];
  make: string;
}

export function ModelSelect({models, make, ...props}: ModelSelectProps) {
  const {setFieldValue} = useFormikContext();
  const [field] = useField({
    name: props.name
  });
  const {data} = useSWR<Model[]>(
      '/api/models?make=' + make, {
        dedupingInterval: 60000,
        onSuccess: (newValues) => {
        if(!newValues.map(a => a.model).includes(field.value)) {
          setFieldValue('model', 'all')
        }
      }}
  );
  const newModels = data || models;

  return(
    <FormControl fullWidth variant="outlined">
      <InputLabel id="search-model">MODEL</InputLabel>
      <Select 
        name="model" 
        labelId="search-model" 
        label="model"
        {...field}
        {...props}
      >
        <MenuItem value="all">
          <em>All Models</em>
        </MenuItem>
        {newModels.map((model) => (
          <MenuItem key={model.model} value={model.model}>
            {`${model.model} (${model.count})`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const brand = getAsString(context.query.make);
  //Execute both concurrently
  const [makes, models] = await Promise.all([
    getMakes(),
    getModels(brand)
  ]);

  return {props: {makes, models}};
}

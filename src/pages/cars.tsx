import { Fragment } from 'react';
import { Grid } from '@material-ui/core';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import Search from '.';
import { CarModel } from '../../api/Car';
import { getMakes, Make } from '../database/getMakes';
import { getModels, Model } from '../database/getModels';
import { getPaginatedCars } from '../database/getPaginatedCars';
import { getAsString } from '../getAsString';
import Pagination from '@material-ui/lab/Pagination';
import PaginationItem from '@material-ui/lab/PaginationItem';
import {PaginationRenderItemParams } from '@material-ui/lab';
import { ParsedUrlQuery } from 'querystring';

export interface CarsListProps {
    makes: Make[];
    models: Model[];
    cars: CarModel[];
    totalPages: number;
}

export default function CarsList({makes, models, cars, totalPages}: CarsListProps) {
    const { query } = useRouter();
    return(
        <Fragment>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={5} md={3} lg={2}>
                    <Search singleColumn makes={makes} models={models}/>
                </Grid>
                <Grid item xs={12} sm={7} md={9} lg={10}>
                    <pre style={{fontSize: '2.5em'}}>
                        <Pagination
                            page={parseInt(getAsString(query.page) || '1')}
                            count={totalPages}
                            renderItem={(item) => (
                                <PaginationItem
                                    component={MaterialUiLink}
                                    query={query}
                                    item={item}
                                    {...item}
                                />
                            )}
                        />
                        {JSON.stringify({totalPages, cars}, null, 4)}
                    </pre>
                </Grid>
            </Grid>
        </Fragment>
    );
}

export interface MaterialUiLinkProps{
    item: PaginationRenderItemParams;
    query: ParsedUrlQuery;
}

export function MaterialUiLink({item, query, ...props}: MaterialUiLinkProps) {
    return <Link href={{
        pathname: '/cars',
        query: {...query, page: item.page}
    }}>
        <a {...props}></a>
    </Link>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const make = getAsString(context.query.make)
    const [makes, models, pagination] = await Promise.all([
        getMakes(), 
        getModels(make),
        getPaginatedCars(context.query)
    ])
    return {
        props: {
            makes, 
            models,
            cars: pagination.cars,
            totalPages: pagination.totalPages
        }};
}


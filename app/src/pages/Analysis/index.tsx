import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import {
    Paper,
    makeStyles,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Input as SelectInput,
    CircularProgress,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    FormControlLabel,
    Checkbox,
    FormGroup,
    TableContainer,
    Table,
    TableHead,
    TableCell,
    TableRow,
    TableBody,
    Dialog,
    AppBar,
    Toolbar,
    IconButton,
    Slide,
} from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions'
import {
    Search as SearchIcon,
    Close,
    Check,
    OpenInNew
} from '@material-ui/icons';
import { useSnackbar } from 'notistack'
import { useMapEvents, Marker, Popup } from '@monsonjeremy/react-leaflet';
import * as L from 'leaflet';
import { format } from 'date-fns';

import api from '../../services/api';
import {
    useAuth
} from '../../hooks/Auth';

import BaseNavbar from '../../components/BaseNavbar';
import Map from '../../components/Map';

import {
    Container,
    Search,
    TextDetail,
    InputGroup,
    ShowDetails,
    MapLink
} from './styles';


import marker from '../../assets/images/Marker.svg';
import markerSuccess from '../../assets/images/MarkerSuccess.svg';

const useStyles = makeStyles((theme) => ({
    paperContent: {
        padding: 15,
        width: '100%',
    },
    form: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-arrow',
        alignItems: 'center',
    },
    selectForm: {
        width: '100%',
        marginLeft: 10,      
        marginRight: 10,
    },
    btnSearch: {
        paddingRight: 40,
        paddingLeft: 40,
    },
    formGroupWeekDays: {
        marginTop: 15,
    },
    snackColor: {
        backgroundColor: '#FFF',
        color: '#000',
    },
    textField: {
        width: '100%',
        marginLeft: 10,      
        marginRight: 10,
    },
    accord: {
        width: '100%',
    },
    iconChecked: {
        color: '#00e676'
    },
    iconNotChecked: {
        color: '#ff3d00'
    },
    accordDetailsBody: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    appBar: {
        position: 'relative',
      },
}));

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

interface IUser {
    id: string;
    name: string;
}

interface IListTask{
    id: string;
    title: string;
}

interface ITask {    
    task: {
        id: string;
        title: string;
        created_at: string;
        days_of_the_week: string;
        start_task: Date;
        end_task: Date;
        enterprise: string;
        executing_user: string;
        finished: boolean;
        repeat: boolean;
        status_task: number;
        type: number; 
    },
    coordinates: [
        {
            id: string;
            latitude: number;
            longitude: number;
        }
    ],
    executing: [
        {
            data: string;
            coordinates: [{
                latitude: number;
                longitude: number;
                timestamp: number;
            }],
            markers:  [{
                id: string;
                latitude: number;
                longitude: number;
                concluded: boolean;
            }] 
        }
    ]
}

interface ICoordPoligan {
    lat: number;
    lng: number;
}

const MarkerIcon = L.icon({
    iconUrl: marker,
    iconSize: [18, 18],
});

const MarkerSuccessIcon = L.icon({
    iconUrl: markerSuccess,
    iconSize: [20, 20],
});

const Analysis: React.FC = () => {
    const { user } = useAuth();
    const formRef = useRef<FormHandles>(null);
    const formTaskRef = useRef<FormHandles>(null);
    const classes = useStyles();
    const [users, setUsers] = useState<IUser[]>([]);
    const [listTask, setListTask] = useState<IListTask[]>([]);
    const [task, setTask] = useState<ITask | null>(null);
    const { enqueueSnackbar } = useSnackbar();
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchStartDate, setSearchStartDate] = useState<string>('');
    const [searchEndDate, setSearchEndDate] = useState<string>('');
    const [analysisType, setAnalysisType] = useState<number>(0);
    const [openMapMarkers, setOpenMapMarkers] = useState<boolean>(false);

    const [userSelect, setUserSelect] = useState<string | null>(null);
    const [taskSelect, setTaskSelect] = useState<string | null>(null);

    const typesTask = ['Ronda', 'Quadrante', 'Ponto de chegada'];

    useEffect(() => {
        (
            async () => {
                api.get(`/user/${user.enterprise}`)
                .then(response => {
                    setUsers(response.data);
                })
                .catch((error: any) => {
                    const msg = error.response? error.response.data.message : 'Houve um erro ao acessar. Tente novamente.';

                    enqueueSnackbar(msg, { variant: 'error' });
                })
            }
        )()
    }, [user.enterprise, enqueueSnackbar]);

    const handleShowMapMarkers = useCallback(() => {
        setOpenMapMarkers(!openMapMarkers);
    }, [openMapMarkers]);

    const handleChangeSelectUser = useCallback( async (event) => {
        setUserSelect(event.target.value as string);

        api.get(`/task/user/${event.target.value}`)
        .then(response => {
            setListTask(response.data);
        })
        .catch((error: any) => {
            const msg = error.response? error.response.data.message : 'Houve um erro ao acessar. Tente novamente.';

            enqueueSnackbar(msg, { variant: 'error' });
        })

    }, [enqueueSnackbar]);

    const handleChangeSelectTask = useCallback( (event) => {
        setTaskSelect(event.target.value as string);

    }, []);
    
    const handleSubmit = useCallback( async () => {
        setBtnLoading(true);

        api.get(`/task/analysis/${taskSelect}`)
        .then(response => {
            setTask(response.data);
            setBtnLoading(false);
        })
        .catch((error: any) => {
            const msg = error.response? error.response.data.message : 'Houve um erro ao acessar. Tente novamente.';

            enqueueSnackbar(msg, { variant: 'error' });
            setBtnLoading(false);
        })

    }, [enqueueSnackbar, taskSelect]);

    const handleSearchStartDate = useCallback((event) => {
        setSearchStartDate(event.target.value as string);
    }, []);

    const handleSearchEndDate = useCallback((event) => {
        setSearchEndDate(event.target.value as string);
    }, []);

    const handleChangeAnalysisType = useCallback((event) => {
        setAnalysisType(Number(event.target.value as string));
    }, []);

    return (
        <BaseNavbar pageActive='analysis' > 
            <Container>
                
                <Search>

                    <h2>Análises</h2>

                    <Paper elevation={3} className={classes.paperContent}>

                        <Form ref={formRef} onSubmit={handleSubmit} className={classes.form}>

                            <FormControl className={classes.selectForm}>
                                <InputLabel id='label-select-user' >Usuário</InputLabel>
                                <Select
                                    labelId='label-select-user'
                                    input={<SelectInput />}
                                    name='executing_user'
                                    variant='filled'
                                    onChange={handleChangeSelectUser}
                                    value={userSelect}
                                    style={{ height: 48 }}
                                >
                                    { users.map(user => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.name}
                                        </MenuItem>
                                    )) }

                                </Select>
                            </FormControl>

                            <FormControl className={classes.selectForm}>
                                <InputLabel id='label-select-user' >Tarefa</InputLabel>
                                <Select
                                    labelId='label-select-user'
                                    input={<SelectInput />}
                                    name='task'
                                    variant='filled'
                                    onChange={handleChangeSelectTask}
                                    value={taskSelect}
                                    style={{ height: 48 }}
                                    disabled={listTask.length > 0 ? false : true}
                                >
                                    { 
                                        listTask.length > 0
                                        ?
                                        listTask.map(task => (
                                                <MenuItem key={task.id} value={task.id}>
                                                    {task.title}
                                                </MenuItem>
                                            )) 
                                        :
                                            <MenuItem>
                                                <CircularProgress />
                                            </MenuItem>
                                    }

                                </Select>
                            </FormControl>

                            <FormControl className={classes.selectForm}>
                                <InputLabel id='label-select-task-type' >Tipo</InputLabel>
                                <Select
                                    labelId='label-select-task-type'
                                    input={<SelectInput />}
                                    name='type'
                                    variant='standard'
                                    onChange={handleChangeAnalysisType}
                                    value={analysisType}
                                    style={{ height: 48 }}
                                >
                                    <MenuItem value={0}>
                                        Diário
                                    </MenuItem>

                                    <MenuItem value={1}>
                                        Período
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label='Início'
                                name='start_task'
                                type='date'
                                variant='filled'
                                className={classes.textField}
                                onChange={handleSearchStartDate}
                                value={searchStartDate}
                                InputLabelProps={{
                                    shrink: true,
                                }}                              
                            />

                            <TextField
                                label='Fim'
                                name='start_task'
                                type='date'
                                variant='filled'
                                className={classes.textField}
                                onChange={handleSearchEndDate}
                                value={searchEndDate}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                disabled={analysisType === 0 ? true : false}                            
                            />

                            <Button
                                variant="contained"
                                color='primary'
                                type='submit'
                                endIcon={
                                    btnLoading ?
                                    <CircularProgress color='inherit' size={18} />
                                    : <SearchIcon />
                                }
                                disabled={btnLoading}
                                className={classes.btnSearch}
                            >
                                Buscar
                            </Button>

                        </Form>

                    </Paper>

                </Search>

                {
                    task &&
                    <ShowDetails>
                        <Accordion className={classes.accord}>
                            <AccordionSummary>
                                <TextDetail>Detalhes da Tarefa: {task.task.title} </TextDetail>
                            </AccordionSummary>
                            <AccordionDetails>

                                <Form 
                                    ref={formTaskRef} 
                                    onSubmit={() => {}}
                                >
                                <InputGroup>

                                    <TextField
                                        variant='outlined'
                                        label='Título'
                                        name='tack_title'
                                        type='text'
                                        value={task.task.title}
                                        className={classes.textField}
                                        disabled
                                    />

                                    <TextField
                                        variant='outlined'
                                        label='Tipo'
                                        name='type_task'
                                        type='text'
                                        value={ typesTask[task.task.type - 1 ]}
                                        className={classes.textField}
                                        disabled
                                    />                                   

                                    <TextField
                                        variant='outlined'
                                        label='Início'
                                        name='start_task'
                                        type='text'
                                        className={classes.textField}
                                        value={format(new Date(task.task.start_task), 'dd/MM/yyyy hh:mm:ss')}      
                                        disabled                       
                                    />

                                    <TextField
                                        variant='outlined'
                                        label='Fim'
                                        name='end_task'
                                        type='text'
                                        className={classes.textField}
                                        value={format(new Date(task.task.end_task), 'dd/MM/yyyy hh:mm:ss')}
                                        disabled
                                    />

                                    </InputGroup>

                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                color='primary' 
                                                checked={!!task.task.repeat}
                                            />
                                        }
                                        label='Repetir'
                                        disabled
                                    />                                    

                                    <FormGroup row className={classes.formGroupWeekDays}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                color='primary' 
                                                checked={task.task.days_of_the_week.split(',').find( day => day === 'sunday') === 'sunday' ? true : false}
                                            />
                                        }
                                        label='Domingo'
                                        disabled
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                color='primary' 
                                                checked={task.task.days_of_the_week.split(',').find( day => day === 'monday') === 'monday' ? true : false}
                                            />
                                        }
                                        label='Segunda'
                                        disabled
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                color='primary'  
                                                checked={task.task.days_of_the_week.split(',').find( day => day === 'tuesday') === 'tuesday' ? true : false}
                                            />
                                        }
                                        label='Terça'
                                        disabled
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                color='primary' 
                                                checked={task.task.days_of_the_week.split(',').find( day => day === 'wednesday') === 'wednesday' ? true : false}
                                            />
                                        }
                                        label='Quarta'
                                        disabled
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                color='primary' 
                                                checked={task.task.days_of_the_week.split(',').find( day => day === 'thursday') === 'thursday' ? true : false}
                                            />
                                        }
                                        label='Quinta'
                                        disabled
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                color='primary' 
                                                checked={task.task.days_of_the_week.split(',').find( day => day === 'friday') === 'friday' ? true : false}
                                            />
                                        }
                                        label='Sexta'
                                        disabled
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                color='primary' 
                                                checked={task.task.days_of_the_week.split(',').find( day => day === 'saturday') === 'saturday' ? true : false}
                                            />
                                        }
                                        label='Sábado'
                                        disabled
                                    />                            

                                    </FormGroup>

                                    <h6>{task.coordinates.length} ponto{task.coordinates.length > 0 ? 's': ''} criado{task.coordinates.length > 0 ? 's': ''} no mapa</h6>
                                </Form>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion className={classes.accord}>
                            <AccordionSummary>
                                <TextDetail> Pontos definidos da tarefa </TextDetail>
                            </AccordionSummary>
                            <AccordionDetails className={classes.accordDetailsBody}>
                                
                                <MapLink onClick={handleShowMapMarkers}>
                                    ver no mapa
                                    <OpenInNew />
                                </MapLink>

                                <TableContainer component={Paper} >
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Latitude</TableCell>
                                                <TableCell>Longitude</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                task.coordinates.map(coordinate => (
                                                    <TableRow key={coordinate.id}>
                                                        <TableCell>{coordinate.id}</TableCell>
                                                        <TableCell>{coordinate.latitude}</TableCell>
                                                        <TableCell>{coordinate.longitude}</TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                            </AccordionDetails>
                        </Accordion>
                        <Accordion className={classes.accord}>
                            <AccordionSummary>
                                <TextDetail> Execução da tarefa: {task.task.title} </TextDetail>
                            </AccordionSummary>
                            <AccordionDetails>

                                {task.executing.map(execute => (

                                    <Accordion className={classes.accord} key={execute.data}>
                                    <AccordionSummary>
                                        <TextDetail> Realizado em: { format(new Date(execute.data), 'dd/MM/yyyy') } </TextDetail>
                                    </AccordionSummary>
                                    <AccordionDetails>

                                        <TableContainer component={Paper} >
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>ID</TableCell>
                                                        <TableCell>Latitude</TableCell>
                                                        <TableCell>Longitude</TableCell>
                                                        <TableCell>Concluído</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {
                                                        execute.markers.map(marker => (
                                                            <TableRow key={marker.id}>
                                                                <TableCell>{marker.id}</TableCell>
                                                                <TableCell>{marker.latitude}</TableCell>
                                                                <TableCell>{marker.longitude}</TableCell>
                                                                <TableCell>
                                                                    { 
                                                                        marker.concluded 
                                                                        ? <Check className={classes.iconChecked} /> 
                                                                        : <Close className={classes.iconNotChecked} /> 
                                                                    }
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    }
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                    </AccordionDetails>
                                    </Accordion>

                                ))}

                            </AccordionDetails>
                        </Accordion>
                        
                        <Dialog
                            fullScreen
                            open={openMapMarkers}
                            onClose={handleShowMapMarkers}
                            TransitionComponent={Transition}
                        >
                            <AppBar className={classes.appBar}>
                                <Toolbar>
                                    <IconButton
                                        edge='start'
                                        color='inherit'
                                        onClick={handleShowMapMarkers}
                                        aria-label='fechar'
                                    >
                                        <Close />
                                    </IconButton>
                                </Toolbar>
                            </AppBar>

                            <Map
                                initialPosition={[task.coordinates[0].latitude, task.coordinates[0].longitude]}  
                                zoomScroll={false}    
                            >
                            
                            <Marker 
                                icon={MarkerIcon}
                                position={{
                                    lat: -22.483122359313782,
                                    lng: -47.472690939903266
                                }}
                            />

                            {/* {
                               
                                task.coordinates.map(coord => (
                                    <Marker
                                        icon={MarkerSuccessIcon}
                                        position={L.latLng(coord.latitude, coord.longitude)}
                                    />
                                ))
                            } */}

                            </Map>

                        </Dialog>

                    </ShowDetails>

                }

            </Container>
        </BaseNavbar>
    );
}

export default Analysis;
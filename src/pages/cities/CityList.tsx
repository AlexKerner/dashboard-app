import { useNavigate, useSearchParams } from "react-router-dom"
import { ToolbarList } from "../../shared/components"
import { LayoutBase } from "../../shared/layouts"
import { useEffect, useMemo, useState } from "react"
import { ICityListing, CityService } from "../../shared/services/api/cities/CityServices"
import { useDebounce } from "../../shared/hooks"
import { IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, useMediaQuery, useTheme } from "@mui/material"
import { Environment } from "../../shared/environment"
import { Delete, Edit } from "@mui/icons-material"




export const CityList: React.FC = () => {

  const theme = useTheme()
  const smDown = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  

  const [ searchParams, setSearchPrams ] = useSearchParams()

  const search = useMemo(() => {
    return searchParams.get('search') || ''
  }, [searchParams])

  const pages = useMemo(() => {
    return Number(searchParams.get('page') || '1')
  }, [searchParams])

  const { debounce } = useDebounce()
  const [rows, setRows] = useState<ICityListing[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {

    setIsLoading(true)

    debounce(() => {
      CityService.getAll(pages, search)
      .then((result) => {
        setIsLoading(false)
        if (result instanceof Error) {
          alert(result.message)
          return
        } else {
          console.log(result)
          setRows(result.data)
          setTotalCount(result.totalCount)
        }
      })
    })
    
  }, [search, pages])

  const handleDelete = (id: number) => {

    if (confirm('Do you really want to delete it?')) {
      CityService.deleteById(id)
        .then (result => {
          if (result instanceof Error) {
            alert(result.message)
          } else {
              setRows( oldRows => {
                return [
                  ...oldRows.filter(oldRow => oldRow.id !== id)
                ]
              })
              alert('Record deleted successfully!')
          }
        })
    }

  }

  return (
    <LayoutBase 
      title="City List" 
      toolbar={<ToolbarList textNewButton="New" showInputSearch textSearch={search} onChangeText={text => setSearchPrams({search: text, page: '1'}, {replace: true})} onClickButton={() => navigate('/cities/detail/new')}/>
      } >
      

    <TableContainer component={Paper} variant="outlined" sx={{ m: 1, width: 'auto' }}>
      <Table>

        <TableHead>
          <TableRow>
            <TableCell width={200}>Actions</TableCell>
            <TableCell>Name</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          
          {rows.map(row => (
            <TableRow key={row.id}>
            <TableCell>

              <IconButton onClick={() => handleDelete(row.id)} size="small" sx={smDown ? {marginRight: 1} : {marginRight: 2}}>
                <Delete />
              </IconButton>

              <IconButton onClick={() => navigate(`/cities/detail/${row.id}`)} size="small">
                <Edit />
              </IconButton>

            </TableCell>
            <TableCell>{row.name}</TableCell>
          </TableRow>
          ))}

        </TableBody>

            {totalCount === 0 && !isLoading && (
              <caption>{Environment.EMPTY_LISTING}</caption>
            )}

        <TableFooter>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={3}>
                <LinearProgress variant="indeterminate" />
              </TableCell>
            </TableRow>
            )}
            {(totalCount > 0 && totalCount > Environment.LINE_LIMIT) && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Pagination 
                    count={ Math.ceil(totalCount / Environment.LINE_LIMIT) } 
                    page={pages } 
                    onChange={(_, newPage) => setSearchPrams({search, page: newPage.toString()}, {replace: true})}
                    sx={smDown ? {display: 'flex', justifyContent: 'center', margin: '0'} : {}} 
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            )}
        </TableFooter>

      </Table>
    </TableContainer>



    </LayoutBase>
  )
}
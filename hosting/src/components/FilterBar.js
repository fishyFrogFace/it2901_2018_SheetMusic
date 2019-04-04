import React from 'react';
import { List, ListItem, ListItemText } from "material-ui";
import { LibraryMusic, SortByAlpha, ViewList, ViewModule } from "material-ui-icons";
import { withStyles } from "material-ui/styles";
import { FilterDrawer, filterSelectors, filterActions } from 'material-ui-filter'

const styles = {


}

const filterFields = [
    { name: 'name', label: 'Name' },
    { name: 'email', label: 'Email' },
    { name: 'registered', label: 'Registered', type: 'date' },
    { name: 'isActive', label: 'Is Active', type: 'bool' },
];

const mapStateToProps = state => {
    const { filters, muiTheme } = state
    const { hasFilters } = filterSelectors.selectFilterProps('demo', filters)
    const list = filterSelectors.getFilteredList('demo', filters, source /*, fieldValue => fieldValue.val*/)

    return {
        hasFilters,
        list
    },

        class FilterBar extends React.Component {
            constructor(props) {
                super(props)

            }





            render() {
                const { c } = this.props;

                return <div>

                    <FilterDrawer
                        name={'demo'}
                        fields={filterFields}

                        //localising the DatePicker
                        locale={'de-DE'}
                        DateTimeFormat={global.Intl.DateTimeFormat}
                        okLabel="OK"
                        cancelLabel="Abbrechen"
                    />

                </div>
            }
        }




    export default withStyles(styles)(FilterBar);